import Phaser from 'phaser';
import type { PlatformDef, VirtualInput } from './types';

const MOVE_SPEED = 210;
const RUN_SPEED = 360;
const GROUND_ACCEL = 2400;
const GROUND_DECEL = 3000;
const AIR_ACCEL = 1600;
const JUMP_VELOCITY = -640;        // stronger jump — more air time
const JUMP_CUT_MULTIPLIER = 0.45;
const GRAVITY_Y = 520;             // gentler gravity — longer arcs
const COYOTE_MS = 240;             // generous coyote time
const JUMP_BUFFER_MS = 240;        // generous jump buffer
const INTERACT_MARGIN = 80;
const FALL_RESET_MARGIN = 60;
const INVINCIBLE_MS = 2000;
const PLATFORM_THICKNESS = 10;    // thin top-edge zones — no side collisions

export interface MainSceneCallbacks {
  onInteract: (platform: PlatformDef) => void;
  onPromptChange: (label: string | null, platformId: string | null) => void;
  onLand: (platformId: string) => void;
  onFall: () => void;
  onJump: () => void;
  onFirstVisit: (platformId: string) => void;
  onStandPlatform: (platformId: string | null) => void;
}

export interface MainSceneInit {
  world: { width: number; height: number; platforms: PlatformDef[] };
  scrollContainer: HTMLElement;
  callbacks: MainSceneCallbacks;
  virtualInput: VirtualInput;
}

export class MainScene extends Phaser.Scene {
  private worldWidth = 0;
  private worldHeight = 0;
  private scrollContainer!: HTMLElement;
  private callbacks!: MainSceneCallbacks;
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerVisual!: Phaser.GameObjects.Sprite;
  private shadow!: Phaser.GameObjects.Graphics;
  private platformsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private platformById = new Map<string, PlatformDef>();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private nearestPlatformId: string | null = null;
  private ready = false;
  private virtualInput!: VirtualInput;
  private lastJumpTick = 0;
  private lastInteractTick = 0;
  private initPlatforms: PlatformDef[] | undefined;

  // Physics feel state
  private standingPlatformId: string | null = null;
  private lastGroundedAt = -Infinity;
  private lastJumpPressedAt = -Infinity;
  private hasBufferedJump = false;
  private wasInAir = false;
  private safeSpawn = { x: 40, y: 40 };
  private originalSpawn = { x: 40, y: 40 };
  private bobPhase = 0;
  private invincibleUntil = 0;
  private visitedPlatformIds = new Set<string>();

  constructor() {
    super('main');
  }

  init(data: MainSceneInit) {
    this.worldWidth = data.world.width;
    this.worldHeight = data.world.height;
    this.scrollContainer = data.scrollContainer;
    this.callbacks = data.callbacks;
    this.initPlatforms = data.world.platforms;
    this.virtualInput = data.virtualInput;
    this.lastJumpTick = data.virtualInput.jumpTick;
    this.lastInteractTick = data.virtualInput.interactTick;
  }

  create() {
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.physics.world.gravity.y = GRAVITY_Y;

    this.platformsGroup = this.physics.add.staticGroup();
    this.applyPlatforms(this.getInitPlatforms());

    const spawn = this.computeSpawn();
    this.safeSpawn = { ...spawn };
    this.createPlayer(spawn);

    // One-way platforms: only resolve collision when player is falling (vy >= -30).
    // Allows the player to jump UP through a platform and land cleanly on top.
    this.physics.add.collider(
      this.player,
      this.platformsGroup,
      undefined,
      (p) => {
        const body = (p as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body;
        return body.velocity.y >= -30;
      },
    );

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyShift = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyE = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.ready = true;
  }

  private getInitPlatforms(): PlatformDef[] {
    return this.initPlatforms ?? [];
  }

  private computeSpawn(): { x: number; y: number } {
    const platforms = this.getInitPlatforms();
    if (platforms.length === 0) return { x: 40, y: 40 };
    const top = platforms.reduce((a, b) => (a.y < b.y ? a : b));
    const spawn = { x: top.x + 40, y: Math.max(0, top.y - 40) };
    this.originalSpawn = { ...spawn };
    return spawn;
  }

  applyPlatforms(platforms: PlatformDef[]) {
    this.platformsGroup.clear(true, true);
    this.platformById.clear();

    for (const def of platforms) {
      this.platformById.set(def.id, def);
      // Thin strip at the TOP edge only — no side collision boxes.
      // This lets the player jump UP through a platform and land cleanly on top.
      const w = Math.max(8, def.width);
      const zone = this.add.zone(
        def.x + def.width / 2,
        def.y + PLATFORM_THICKNESS / 2,
        w,
        PLATFORM_THICKNESS,
      );
      this.physics.add.existing(zone, true);
      this.platformsGroup.add(zone);
    }
  }

  resizeWorld(width: number, height: number) {
    this.worldWidth = width;
    this.worldHeight = height;
    this.physics.world.setBounds(0, 0, width, height);
  }

  private createPlayer(spawn: { x: number; y: number }) {
    const size = 28;
    const key = 'player-tex';
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Body / jacket
      g.fillStyle(0x2f81f7, 1);
      g.fillRoundedRect(2, 12, size - 4, 28, 6);
      // Jacket center line
      g.fillStyle(0x1a65c7, 1);
      g.fillRect(size / 2 - 1, 14, 2, 16);
      // Head
      g.fillStyle(0xffe8c8, 1);
      g.fillCircle(size / 2, 9, 9);
      // Hair
      g.fillStyle(0x2c2c2c, 1);
      g.fillRoundedRect(4, 2, size - 8, 8, { tl: 5, tr: 5, bl: 0, br: 0 });
      // Eyes
      g.fillStyle(0x1f1f1f, 1);
      g.fillCircle(size / 2 - 3, 8, 1.8);
      g.fillCircle(size / 2 + 3, 8, 1.8);
      // Smile
      g.fillStyle(0xcc8860, 1);
      g.fillRect(size / 2 - 2, 11, 5, 1);
      g.generateTexture(key, size, 44);
      g.destroy();
    }

    // Drop shadow
    this.shadow = this.add.graphics();
    this.shadow.setDepth(8);

    // Invisible physics body — NO world bounds so player can fall off bottom
    this.player = this.physics.add.sprite(spawn.x, spawn.y, key);
    this.player.setVisible(false);
    this.player.setCollideWorldBounds(false); // free-fall enables respawn detection
    this.player.setBounce(0);
    this.player.setSize(size - 6, 40);
    this.player.setOffset(3, 2);

    // Visual sprite (squash/stretch tweens applied here, not on physics body)
    this.playerVisual = this.add.sprite(spawn.x, spawn.y, key);
    this.playerVisual.setDepth(10);
  }

  update(time: number, delta: number) {
    if (!this.ready || !this.player.body) return;
    const dt = Math.min(delta, 48) / 1000;

    const jumpTapped = this.virtualInput.jumpTick !== this.lastJumpTick;
    this.lastJumpTick = this.virtualInput.jumpTick;
    const interactTapped = this.virtualInput.interactTick !== this.lastInteractTick;
    this.lastInteractTick = this.virtualInput.interactTick;

    const running = this.keyShift.isDown || this.virtualInput.run;
    const maxSpeed = running ? RUN_SPEED : MOVE_SPEED;
    const left = this.cursors.left.isDown || this.keyA.isDown || this.virtualInput.left;
    const right = this.cursors.right.isDown || this.keyD.isDown || this.virtualInput.right;
    const jumpHeld = this.cursors.up.isDown || this.keyW.isDown || this.cursors.space.isDown || this.virtualInput.jumpHeld;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keyW) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      jumpTapped;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    if (onGround) {
      this.lastGroundedAt = time;
      this.safeSpawn = { x: this.player.x, y: this.player.y };
    }

    // Detect standing platform and notify React for highlight
    const newStandingId = onGround ? this.detectStandingPlatform() : null;
    if (newStandingId !== this.standingPlatformId) {
      this.standingPlatformId = newStandingId;
      this.callbacks.onStandPlatform(newStandingId);
    }

    // Horizontal movement with acceleration
    const accel = onGround ? GROUND_ACCEL : AIR_ACCEL;
    const decel = onGround ? GROUND_DECEL : AIR_ACCEL;
    const dir = left && !right ? -1 : right && !left ? 1 : 0;
    let vx = body.velocity.x;
    if (dir !== 0) {
      const targetVx = dir * maxSpeed;
      const step = accel * dt;
      vx = Math.abs(targetVx - vx) <= step ? targetVx : vx + Math.sign(targetVx - vx) * step;
      this.playerVisual.setFlipX(dir < 0);
    } else {
      const step = decel * dt;
      vx = Math.abs(vx) <= step ? 0 : vx - Math.sign(vx) * step;
    }
    this.player.setVelocityX(vx);

    // Jump with coyote time + input buffering
    if (jumpPressed) this.lastJumpPressedAt = time;
    const withinCoyote = time - this.lastGroundedAt <= COYOTE_MS;
    const withinBuffer = time - this.lastJumpPressedAt <= JUMP_BUFFER_MS;
    if (withinBuffer && withinCoyote && !this.hasBufferedJump) {
      this.player.setVelocityY(JUMP_VELOCITY);
      this.hasBufferedJump = true;
      this.lastGroundedAt = -Infinity;
      this.playSquash(1.22, 0.78);
      this.spawnDust(this.player.x, this.player.y + 20, 4, true);
      this.callbacks.onJump();
    }
    if (onGround) this.hasBufferedJump = false;

    // Variable jump height (short hop)
    if (!jumpHeld && body.velocity.y < JUMP_VELOCITY * JUMP_CUT_MULTIPLIER) {
      this.player.setVelocityY(body.velocity.y * (1 - JUMP_CUT_MULTIPLIER));
    }

    // Landing feedback
    if (this.wasInAir && onGround) {
      this.playSquash(0.74, 1.18);
      this.spawnDust(this.player.x, this.player.y + 20, 6, false);
      this.emitLandPlatform();
    }
    this.wasInAir = !onGround;

    // Invincibility blinking
    const isInvincible = time < this.invincibleUntil;
    this.playerVisual.setVisible(isInvincible ? Math.floor(time / 110) % 2 === 0 : true);
    this.shadow.setVisible(!isInvincible || Math.floor(time / 110) % 2 === 0);

    this.updateVisual(onGround, dt, body.velocity.y);
    this.recoverFromFalls(time);
    this.updateInteraction(interactTapped);
    this.followScroll();
  }

  /** Dust puff particles — diverge outward for landing, upward for jump */
  private spawnDust(x: number, y: number, count: number, isJump: boolean) {
    for (let i = 0; i < count; i++) {
      const g = this.add.graphics();
      const r = isJump ? Phaser.Math.Between(2, 4) : Phaser.Math.Between(3, 6);
      g.fillStyle(isJump ? 0xcccccc : 0xbbbbbb, 0.75);
      g.fillCircle(0, 0, r);
      g.setDepth(9);
      g.x = x + Phaser.Math.Between(-12, 12);
      g.y = y;

      const spreadAngle = isJump
        ? (Phaser.Math.Between(150, 210)) * (Math.PI / 180)
        : Phaser.Math.Between(0, 360) * (Math.PI / 180);
      const dist = Phaser.Math.Between(18, 52);
      this.tweens.add({
        targets: g,
        x: g.x + Math.cos(spreadAngle) * dist,
        y: g.y + Math.sin(spreadAngle) * dist * (isJump ? 0.5 : 0.35),
        alpha: 0,
        scaleX: 0.15,
        scaleY: 0.15,
        duration: Phaser.Math.Between(260, 420),
        ease: 'Power2.Out',
        onComplete: () => g.destroy(),
      });
    }
  }

  private updateVisual(onGround: boolean, dt: number, velY: number) {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let bobOffset = 0;

    if (onGround && Math.abs(body.velocity.x) > 10) {
      this.bobPhase += dt * (Math.abs(body.velocity.x) / 40);
      bobOffset = Math.sin(this.bobPhase * Math.PI * 2) * 2;
    } else {
      this.bobPhase = 0;
    }

    this.playerVisual.x = this.player.x;
    this.playerVisual.y = this.player.y - Math.abs(bobOffset);

    // Lean forward in air
    const targetAngle = onGround ? 0 : Math.min(Math.max(velY / 45, -8), 8);
    this.playerVisual.angle = this.playerVisual.angle + (targetAngle - this.playerVisual.angle) * 0.2;

    // Drop shadow — projects onto the nearest platform below
    this.shadow.clear();
    let shadowY = this.player.y + 24;
    for (const def of this.platformById.values()) {
      if (def.y > this.player.y &&
          this.player.x >= def.x &&
          this.player.x <= def.x + def.width &&
          def.y < shadowY + 300) {
        shadowY = Math.min(shadowY, def.y + 3);
      }
    }
    const dist = Math.max(0, shadowY - (this.player.y + 20));
    const shadowAlpha = Math.max(0.04, 0.2 - dist / 280);
    const shadowScale = Math.max(0.25, 1 - dist / 200);
    this.shadow.fillStyle(0x000000, shadowAlpha);
    this.shadow.fillEllipse(this.player.x, shadowY, 26 * shadowScale, 8 * shadowScale);
  }

  private playSquash(scaleX: number, scaleY: number) {
    this.playerVisual.setScale(scaleX, scaleY);
    this.tweens.add({
      targets: this.playerVisual,
      scaleX: 1,
      scaleY: 1,
      duration: 145,
      ease: 'Sine.easeOut',
    });
  }

  /** Return the platform id the player is currently standing on, or null. */
  private detectStandingPlatform(): string | null {
    const playerBottom = this.player.y + 20;
    let bestId: string | null = null;
    let bestDist = Infinity;
    for (const def of this.platformById.values()) {
      const withinX = this.player.x >= def.x - 5 && this.player.x <= def.x + def.width + 5;
      if (!withinX) continue;
      const dist = Math.abs(playerBottom - def.y);
      if (dist < 34 && dist < bestDist) {
        bestDist = dist;
        bestId = def.id;
      }
    }
    return bestId;
  }

  /** Detect which platform the player just landed on and emit callbacks. */
  private emitLandPlatform() {
    const playerBottom = this.player.y + 20;
    let closest: PlatformDef | null = null;
    let closestDist = Infinity;
    for (const def of this.platformById.values()) {
      const withinX = this.player.x >= def.x - 8 && this.player.x <= def.x + def.width + 8;
      if (!withinX) continue;
      const dist = Math.abs(playerBottom - def.y);
      if (dist < 50 && dist < closestDist) {
        closestDist = dist;
        closest = def;
      }
    }
    if (closest) {
      this.callbacks.onLand(closest.id);
      if (!this.visitedPlatformIds.has(closest.id)) {
        this.visitedPlatformIds.add(closest.id);
        this.callbacks.onFirstVisit(closest.id);
      }
    }
  }

  /** Respawn at original top spawn when player falls off the bottom. */
  private recoverFromFalls(time: number) {
    if (this.player.y <= this.worldHeight + FALL_RESET_MARGIN) return;

    // Always teleport back — even during invincibility — to prevent infinite falling.
    // Only skip the onFall() callback (which costs a life) when still invincible.
    this.player.setVelocity(0, 0);
    this.player.setPosition(this.originalSpawn.x, this.originalSpawn.y);

    if (time < this.invincibleUntil) return; // silent respawn, no life lost
    this.safeSpawn = { ...this.originalSpawn };
    this.invincibleUntil = time + INVINCIBLE_MS;
    this.callbacks.onFall();
  }

  private updateInteraction(interactTapped: boolean) {
    const px = this.player.x;
    const py = this.player.y + 12;

    let nearest: PlatformDef | null = null;
    let nearestDist = Infinity;

    for (const def of this.platformById.values()) {
      const cx = def.x + def.width / 2;
      const cy = def.y;
      const withinX = px >= def.x - INTERACT_MARGIN && px <= def.x + def.width + INTERACT_MARGIN;
      const withinY = Math.abs(py - cy) <= INTERACT_MARGIN + 30;
      if (withinX && withinY) {
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = def;
        }
      }
    }

    const nearestId = nearest ? nearest.id : null;
    if (nearestId !== this.nearestPlatformId) {
      this.nearestPlatformId = nearestId;
      this.callbacks.onPromptChange(nearest ? nearest.label : null, nearestId);
    }

    if (nearest && (Phaser.Input.Keyboard.JustDown(this.keyE) || interactTapped)) {
      this.callbacks.onInteract(nearest);
    }
  }

  private followScroll() {
    if (!this.scrollContainer) return;
    const vh = this.scrollContainer.clientHeight;
    const vw = this.scrollContainer.clientWidth;

    const maxY = Math.max(0, this.worldHeight - vh);
    const tY = Math.min(Math.max(this.player.y - vh / 2, 0), maxY);
    this.scrollContainer.scrollTop += (tY - this.scrollContainer.scrollTop) * 0.18;

    const maxX = Math.max(0, this.worldWidth - vw);
    const tX = Math.min(Math.max(this.player.x - vw / 2, 0), maxX);
    this.scrollContainer.scrollLeft += (tX - this.scrollContainer.scrollLeft) * 0.18;
  }
}
