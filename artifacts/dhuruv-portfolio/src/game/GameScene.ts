import Phaser from 'phaser';
import playerSpriteUrl from '@assets/player-sprite.png';

export interface GameStats {
  timeMs:             number;
  jumps:              number;
  secretFound:        boolean;
  fragmentsCollected: number;
}

export interface GameCallbacks {
  onComplete:        (stats: GameStats) => void;
  onBack:            () => void;
  onFragmentCollect: (count: number) => void;
}


const DISC = [
  { name: 'SYSTEMS',      sub: 'I design loops where every mechanic talks to every other' },
  { name: 'LEVEL DESIGN', sub: 'Spatial pacing that guides players — without holding their hand' },
  { name: 'COMBAT',       sub: 'Hit-feel first. Hitboxes, arcs, and feedback that land right' },
  { name: 'PROGRESSION',  sub: 'Reward structures built around player motivation, not FOMO' },
  { name: 'NARRATIVE',    sub: 'Stories that change — branching paths, real consequences' },
  { name: 'ECONOMY',      sub: 'Resource loops balanced so winning feels earned, not bought' },
  { name: 'UX',           sub: 'If players need a tutorial, the design already failed' },
  { name: 'BALANCING',    sub: 'I playtest my own games until I break them. Then I fix them' },
  { name: 'ITERATION',    sub: 'Fast prototypes, honest feedback, shipped improvements' },
  { name: 'PLAYTESTING',  sub: 'Sessions with real players. Not assumptions. Evidence.' },
] as const;


// ── Layout ────────────────────────────────────────────────────────────
const BW           = 118;
const BH           = 148;
const BD           = 13;
const WORD_GAP     = 44;
const LEFT_MARGIN  = 180;   // spawn closer so first block is visible immediately
const RIGHT_TRAIL  = 200;
const ZIGZAG_STEP  = 48;

// ── Physics ───────────────────────────────────────────────────────────
const CW        = 20;
const CH        = 44;
const RUN_SPEED = 285;
const JUMP_VY   = -650;
const MAX_FALL  = 1000;
const COYOTE_MS = 110;
const BUFFER_MS = 100;

// ── Intro pan ─────────────────────────────────────────────────────────
// On game start, camera shows INTRO_EXTRA px ahead of player, then lerps back.
// This gives the "world reveal" hook within the first 3 seconds.
const INTRO_EXTRA_PX = 260;
const INTRO_PAN_MS   = 3400;

// ── Proximity glow ───────────────────────────────────────────────────
const PROX_DIST = 280; // px — blocks glow when player is within this range

// ── Dust particles ────────────────────────────────────────────────────
interface Dust { x: number; y: number; r: number; vx: number; vy: number; a: number; }

type PhysBody = Phaser.Physics.Arcade.Body;
type PhysRect = Phaser.GameObjects.Rectangle & { body: PhysBody };


export class GameScene extends Phaser.Scene {
  private cb: GameCallbacks;

  // ── Physics ──────────────────────────────────────────────────────────
  private player!: PhysRect;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private platCollider:     Phaser.Physics.Arcade.Collider | null = null;
  private leftWallCollider: Phaser.Physics.Arcade.Collider | null = null;

  // ── World ────────────────────────────────────────────────────────────
  private groundY    = 0;
  private worldEndX  = 0;
  private blockX:    number[] = [];
  private blockY:    number[] = [];
  private worldObjs: Phaser.GameObjects.GameObject[] = [];
  private blockGlow: Phaser.GameObjects.Graphics[]   = [];

  // ── Character sprite ─────────────────────────────────────────────────
  private charGfx!: Phaser.GameObjects.Graphics;
  private charImg: Phaser.GameObjects.Image | null = null;
  private spriteBaseScale = 0.065;
  private walkT      = 0;
  private idleT      = 0;       // for breathing animation
  private facingRight = true;
  private wasOnGround = false;
  private prevVY      = 0;
  private landSquash  = 0;

  // ── Dust particles ───────────────────────────────────────────────────
  private dustParticles: Dust[] = [];
  private dustGfx: Phaser.GameObjects.Graphics | null = null;

  // ── Intro pan ────────────────────────────────────────────────────────
  private introPanDone   = false;
  private introPanTween: Phaser.Tweens.Tween | null = null;

  // ── Cards & UI ───────────────────────────────────────────────────────
  private activeBlock = -1;
  private shownBlock  = -1;
  private revealCard: Phaser.GameObjects.Container | null = null;
  private hintContainer: Phaser.GameObjects.Container | null = null;
  private hintDone   = false;
  private endStarted = false;

  // ── Input ────────────────────────────────────────────────────────────
  private isJumping  = false;
  private lastGround = 0;
  private lastJump   = -9999;
  private jumpCount  = 0;
  private prevTJump  = false;
  private startTime  = 0;

  public tLeft  = false;
  public tRight = false;
  public tJump  = false;

  private cursors!:  Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!:     Phaser.Input.Keyboard.Key;
  private keyD!:     Phaser.Input.Keyboard.Key;
  private keyW!:     Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  constructor(cb: GameCallbacks) {
    super({ key: 'GameScene' });
    this.cb = cb;
  }


  // ══════════════════════════════════════════════════════════════════════
  //  LIFECYCLE
  // ══════════════════════════════════════════════════════════════════════

  preload() {
    this.load.image('player', playerSpriteUrl);
  }

  create() {
    this.startTime = Date.now();
    this.cameras.main.setBackgroundColor('#ffffff');
    this.buildWorld();

    // Snap camera to player before lerp-follow starts (prevents world-origin flash)
    const W = this.scale.width, H = this.scale.height;
    const spawnX = LEFT_MARGIN - 80;
    this.cameras.main.setScroll(
      Math.max(0, spawnX + 160 - W / 2),
      Math.max(0, this.groundY + 30 - H / 2),
    );

    this.setupCamera();

    // ── Intro pan: reveal world ahead then settle on player ────────────
    // Sets camera offset to show INTRO_EXTRA_PX ahead, then tweens back.
    // Gives viewer an immediate "world preview" hook without any input.
    this.cameras.main.setFollowOffset(-(160 + INTRO_EXTRA_PX), 30);
    this.introPanTween = this.tweens.addCounter({
      from:     -(160 + INTRO_EXTRA_PX),
      to:       -160,
      duration: INTRO_PAN_MS,
      ease:     'Sine.easeInOut',
      onUpdate: (tw) => {
        if (!this.introPanDone) this.cameras.main.setFollowOffset(tw.getValue() ?? -160, 30);
      },
      onComplete: () => { this.introPanDone = true; },
    });

    this.setupInput();
    this.scale.on('resize', this.onResize, this);
  }


  // ══════════════════════════════════════════════════════════════════════
  //  WORLD BUILDING
  // ══════════════════════════════════════════════════════════════════════

  private buildWorld() {
    const H = this.scale.height;
    this.groundY = Math.round(H * 0.46);

    // ── Tear down ──────────────────────────────────────────────────────
    if (this.leftWallCollider) {
      this.physics.world.removeCollider(this.leftWallCollider);
      this.leftWallCollider = null;
    }
    for (const o of this.worldObjs) if ((o as Phaser.GameObjects.GameObject).active) o.destroy();
    this.worldObjs = [];
    this.blockGlow = [];
    this.blockX    = [];
    this.blockY    = [];

    if (this.platforms) this.platforms.clear(true, true);
    this.platforms = this.physics.add.staticGroup();

    // ── Background ────────────────────────────────────────────────────
    this.buildBackground();

    // ── World bounds ──────────────────────────────────────────────────
    const letters  = 'GAMEDESIGN';
    const span     = letters.length * BW + WORD_GAP + LEFT_MARGIN + RIGHT_TRAIL;
    this.worldEndX = LEFT_MARGIN + span;

    // Starting platform — extends from left wall so no dead-end
    this.addPlat(LEFT_MARGIN / 2, this.groundY, LEFT_MARGIN, 10);

    // ── Blocks with stagger reveal ────────────────────────────────────
    for (let i = 0; i < letters.length; i++) {
      const ws   = i >= 4 ? WORD_GAP : 0;
      const bx   = LEFT_MARGIN + i * BW + ws;
      const topY = i % 2 === 1 ? this.groundY - ZIGZAG_STEP : this.groundY;
      this.blockX.push(bx);
      this.blockY.push(topY);
      this.buildBlock(bx, topY, letters[i], i);
      this.addPlat(bx + BW / 2, topY, BW, 10);
    }

    // Right-trail walkable surface
    const trailStartX = this.worldEndX - RIGHT_TRAIL;
    this.addPlat(trailStartX + RIGHT_TRAIL / 2, this.groundY, RIGHT_TRAIL, 10);

    this.buildGroundLine();

    // ── Player ────────────────────────────────────────────────────────
    const spawnX = LEFT_MARGIN - 80;
    const spawnY = this.groundY - CH / 2 - 2;

    if (!this.player) {
      this.player = this.add.rectangle(spawnX, spawnY, CW, CH, 0, 0) as PhysRect;
      this.physics.add.existing(this.player);
    } else {
      this.player.setPosition(spawnX, spawnY);
      this.player.body.reset(spawnX, spawnY);
    }

    const pb = this.player.body;
    pb.setMaxVelocityY(MAX_FALL);
    pb.setCollideWorldBounds(false);
    pb.checkCollision.up = false;

    if (this.platCollider) {
      this.physics.world.removeCollider(this.platCollider);
      this.platCollider = null;
    }
    this.platCollider = this.physics.add.collider(
      this.player as unknown as Phaser.GameObjects.GameObject,
      this.platforms,
      undefined,
      () => this.player.body.velocity.y >= 0,
      this,
    );

    // Invisible left barrier
    const leftWall = this.add.rectangle(-5, this.scale.height / 2, 10, this.scale.height * 4, 0, 0) as PhysRect;
    this.physics.add.existing(leftWall, true);
    this.worldObjs.push(leftWall);
    this.leftWallCollider = this.physics.add.collider(
      this.player as unknown as Phaser.GameObjects.GameObject,
      leftWall as unknown as Phaser.GameObjects.GameObject,
    );

    // ── Persistent graphics ───────────────────────────────────────────
    if (!this.charGfx) this.charGfx = this.add.graphics().setDepth(29);
    if (!this.dustGfx) this.dustGfx = this.add.graphics().setDepth(31);

    // ── Sprite ───────────────────────────────────────────────────────
    const feetY = this.groundY - 4;

    if (!this.charImg) {
      this.charImg = this.add.image(spawnX, feetY, 'player')
        .setOrigin(0.5, 1)
        .setDepth(30);
      const src  = this.charImg.texture.getSourceImage() as HTMLImageElement;
      const texH = src.naturalHeight || src.height || 0;
      if (texH > 0) this.spriteBaseScale = 70 / texH;
    } else {
      this.charImg.setPosition(spawnX, feetY);
    }

    if (!this.hintDone) this.buildHint();
  }


  // ── Parallax background — three layers at different scroll speeds ────
  private buildBackground() {
    const H = this.scale.height;

    // Far layer — very faint large grid
    const g0 = this.add.graphics().setDepth(0).setScrollFactor(0.05, 0);
    g0.fillStyle(0x000000, 0.018);
    for (let x = 0; x < 5000; x += 80)
      for (let y = 0; y < H; y += 80)
        g0.fillRect(x, y, 3, 3);
    this.worldObjs.push(g0);

    // Mid layer — standard dot grid
    const g1 = this.add.graphics().setDepth(1).setScrollFactor(0.15, 0);
    g1.fillStyle(0x000000, 0.028);
    for (let x = 0; x < 4400; x += 44)
      for (let y = 0; y < H; y += 44)
        g1.fillRect(x, y, 2, 2);
    this.worldObjs.push(g1);

    // Near layer — slightly faster, slightly darker dots
    const g2 = this.add.graphics().setDepth(2).setScrollFactor(0.35, 0);
    g2.fillStyle(0x000000, 0.022);
    for (let x = 0; x < 3800; x += 66)
      for (let y = 0; y < H; y += 66)
        g2.fillRect(x, y, 2, 2);
    this.worldObjs.push(g2);

    // Atmospheric gradient strip above ground line
    const g3 = this.add.graphics().setDepth(3).setScrollFactor(0.5, 0);
    g3.fillStyle(0x000000, 0.012);
    g3.fillRect(0, this.groundY - 60, 5000, 60);
    this.worldObjs.push(g3);
  }


  // ── 3D letter block ─────────────────────────────────────────────────
  private buildBlock(bx: number, topY: number, letter: string, idx: number) {
    const g = this.add.graphics().setDepth(10);
    this.worldObjs.push(g);

    // Drop shadow
    g.fillStyle(0x000000, 0.045);
    g.fillRect(bx + 7, topY + 8, BW + BD, BH + 8);

    // Right face (3D depth)
    g.fillStyle(0xa0a0a0);
    g.fillTriangle(bx + BW, topY,      bx + BW + BD, topY - BD,      bx + BW + BD, topY + BH - BD);
    g.fillTriangle(bx + BW, topY,      bx + BW,      topY + BH,       bx + BW + BD, topY + BH - BD);

    // Top face
    g.fillStyle(0xf0f0f0);
    g.fillTriangle(bx,       topY,      bx + BW,      topY,       bx + BW + BD, topY - BD);
    g.fillTriangle(bx,       topY,      bx + BD,       topY - BD,  bx + BW + BD, topY - BD);

    // Front face with subtle gradient simulation (lighter top strip)
    g.fillStyle(0xe4e4e4);
    g.fillRect(bx, topY, BW, BH);
    g.fillStyle(0xf0f0f0, 0.5);
    g.fillRect(bx, topY, BW, 24); // lighter top

    // Inner vignette
    g.fillStyle(0x000000, 0.022);
    g.fillRect(bx, topY, BW, 8);
    g.fillRect(bx, topY, 5, BH);

    // Walking-surface highlight
    g.lineStyle(2.5, 0xffffff, 1);
    g.lineBetween(bx + 2, topY, bx + BW - 2, topY);

    // Rim
    g.lineStyle(1, 0x909090, 0.22);
    g.strokeRect(bx, topY, BW, BH);

    // 3D corner lines
    g.lineStyle(1, 0x888888, 0.18);
    g.lineBetween(bx,      topY,      bx + BD,       topY - BD);
    g.lineBetween(bx + BW, topY,      bx + BW + BD,  topY - BD);
    g.lineBetween(bx + BW, topY + BH, bx + BW + BD,  topY + BH - BD);

    // Block index on side face
    const numLbl = this.add.text(
      bx + BW + BD / 2 + 1,
      topY + BH / 2 - BD / 2,
      String(idx + 1).padStart(2, '0'),
      { fontFamily: "'Space Mono', monospace", fontSize: '7px', color: '#888888' },
    ).setOrigin(0.5, 0.5).setDepth(12).setAngle(-6);
    this.worldObjs.push(numLbl);

    // Large letter on face
    const ltr = this.add.text(bx + BW / 2, topY + BH * 0.50, letter, {
      fontFamily: "'Space Mono', monospace",
      fontSize:   `${Math.round(BW * 0.62)}px`,
      color:      '#181818',
      fontStyle:  'bold',
    }).setOrigin(0.5, 0.5).setDepth(12).setAlpha(0.80);
    this.worldObjs.push(ltr);

    // Word label above mid-block (GAME / DESIGN)
    if (idx === 0 || idx === 4) {
      const word = idx === 0 ? 'GAME' : 'DESIGN';
      const lx   = idx === 0 ? bx + BW * 2 : bx + BW * 3;
      const lbl  = this.add.text(lx, topY - 30, word, {
        fontFamily:    "'Space Mono', monospace",
        fontSize:      '8px',
        color:         '#c0c0c0',
        letterSpacing: 6,
      }).setOrigin(0.5, 1).setDepth(12);
      this.worldObjs.push(lbl);
    }

    // Per-block active glow layer — alpha-animated on player contact
    const glow = this.add.graphics().setDepth(14).setAlpha(0);
    glow.lineStyle(2, 0x000000, 0.18);
    glow.strokeRect(bx, topY, BW, BH);
    glow.fillStyle(0xffffff, 0.07);
    glow.fillRect(bx + 1, topY + 1, BW - 2, BH - 2);
    glow.lineStyle(3, 0x000000, 0.12);
    glow.lineBetween(bx + 1, topY, bx + BW - 1, topY);
    this.blockGlow.push(glow);
    this.worldObjs.push(glow);

    // ── Stagger reveal: fade blocks in from 0 sequentially ─────────────
    // Only animate on first creation (not on resize rebuilds)
    if (!this.introPanDone) {
      g.setAlpha(0);
      numLbl.setAlpha(0);
      ltr.setAlpha(0);
      const delay = 400 + idx * 90;
      this.tweens.add({ targets: [g, numLbl],  alpha: 1, duration: 350, delay, ease: 'Cubic.easeOut' });
      this.tweens.add({ targets: ltr,           alpha: 0.80, duration: 350, delay: delay + 80, ease: 'Cubic.easeOut' });
    }
  }


  private buildGroundLine() {
    const g = this.add.graphics().setDepth(8);
    g.lineStyle(1.5, 0xd0d0d0, 1);
    g.lineBetween(0, this.groundY, this.worldEndX + 100, this.groundY);
    // Subtle shadow below ground
    g.lineStyle(1, 0x000000, 0.04);
    g.lineBetween(0, this.groundY + 2, this.worldEndX + 100, this.groundY + 2);
    this.worldObjs.push(g);
  }


  private addPlat(cx: number, cy: number, w: number, h: number) {
    const r = this.add.rectangle(cx, cy, w, h, 0, 0) as PhysRect;
    this.physics.add.existing(r, true);
    this.platforms.add(r, true);
  }


  // ── Hint ─────────────────────────────────────────────────────────────
  private buildHint() {
    if (this.hintContainer) { this.hintContainer.destroy(); this.hintContainer = null; }

    const W = this.scale.width, H = this.scale.height;
    const c = this.add.container(0, 0).setScrollFactor(0).setDepth(50).setAlpha(0);

    const arrow = this.add.text(W / 2, H * 0.83, '→', {
      fontFamily: "'Space Mono', monospace", fontSize: '18px', color: '#b0b0b0',
    }).setOrigin(0.5, 0.5);
    const lbl = this.add.text(W / 2, H * 0.83 + 22, 'WALK RIGHT', {
      fontFamily: "'Space Mono', monospace", fontSize: '9px',
      color: '#c4c4c4', letterSpacing: 4,
    }).setOrigin(0.5, 0.5);

    c.add([arrow, lbl]);
    this.hintContainer = c;

    this.tweens.add({ targets: c, alpha: 1, duration: 600, delay: 800, ease: 'Sine.easeOut' });
    this.tweens.add({
      targets: arrow, x: W / 2 + 9, yoyo: true, repeat: -1,
      duration: 640, ease: 'Sine.easeInOut',
    });
  }

  private hideHint() {
    if (this.hintDone || !this.hintContainer) return;
    this.hintDone = true;
    const c = this.hintContainer;
    this.hintContainer = null;
    this.tweens.killTweensOf(c.list);
    this.tweens.add({
      targets: c, alpha: 0, duration: 220, ease: 'Sine.easeOut',
      onComplete: () => c.destroy(),
    });
  }


  // ══════════════════════════════════════════════════════════════════════
  //  CAMERA & INPUT
  // ══════════════════════════════════════════════════════════════════════

  private setupCamera() {
    this.cameras.main.startFollow(
      this.player as unknown as Phaser.GameObjects.GameObject,
      false, 0.10, 0.10,   // slightly tighter lerp for snappier feel
    );
    this.cameras.main.setFollowOffset(-160, 30);
    this.cameras.main.setDeadzone(36, 24);
  }

  private setupInput() {
    const kb = this.input.keyboard!;
    this.cursors  = kb.createCursorKeys();
    this.keyA     = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD     = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW     = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    kb.on('keydown-ESC', () => this.cb.onBack());
  }

  private onResize() {
    const prevX = this.player?.x ?? LEFT_MARGIN - 80;
    this.dismissCard(true);
    this.buildWorld();
    if (this.player) {
      this.player.setPosition(prevX, this.groundY - CH / 2 - 2);
      this.player.body.reset(prevX, this.groundY - CH / 2 - 2);
    }
    this.setupCamera();
    this.activeBlock = -1;
    this.shownBlock  = -1;
    // On resize, intro pan is already done or wasn't running — keep normal offset
    this.introPanDone = true;
    this.cameras.main.setFollowOffset(-160, 30);
  }


  // ══════════════════════════════════════════════════════════════════════
  //  UPDATE LOOP
  // ══════════════════════════════════════════════════════════════════════

  update(time: number, delta: number) {
    if (this.endStarted) return;

    const body     = this.player.body;
    const onGround = body.blocked.down;
    const dt       = delta / 1000;

    // ── Landing detection (for dust spawn) ───────────────────────────
    if (!this.wasOnGround && onGround && this.prevVY > 200) {
      this.landSquash = 1;
      this.spawnDust(this.player.x, this.groundY - 4, this.prevVY);
    }
    this.wasOnGround = onGround;
    this.prevVY      = body.velocity.y;

    if (onGround) this.lastGround = time;
    const coyote = (time - this.lastGround) < COYOTE_MS;

    // ── Jump input ────────────────────────────────────────────────────
    const justJump =
      Phaser.Input.Keyboard.JustDown(this.cursors.up)  ||
      Phaser.Input.Keyboard.JustDown(this.keyW)         ||
      Phaser.Input.Keyboard.JustDown(this.keySpace)     ||
      (this.tJump && !this.prevTJump);
    const heldJump =
      this.cursors.up.isDown || this.keyW.isDown ||
      this.keySpace.isDown   || this.tJump;

    if (justJump) this.lastJump = time;
    if ((time - this.lastJump) < BUFFER_MS && coyote) this.doJump();
    if (this.isJumping && !heldJump && body.velocity.y < -200) {
      body.setVelocityY(-200);
      this.isJumping = false;
    }
    if (onGround) this.isJumping = false;

    // ── Movement ─────────────────────────────────────────────────────
    const goLeft  = this.cursors.left.isDown  || this.keyA.isDown  || this.tLeft;
    const goRight = this.cursors.right.isDown || this.keyD.isDown  || this.tRight;

    if ((goLeft || goRight) && !this.hintDone) this.hideHint();

    // Cancel intro pan immediately when player moves
    if ((goLeft || goRight) && !this.introPanDone) {
      this.introPanDone = true;
      if (this.introPanTween) { this.introPanTween.stop(); this.introPanTween = null; }
      this.cameras.main.setFollowOffset(-160, 30);
    }

    let targetVX = 0;
    if (goLeft)  { targetVX = -RUN_SPEED; this.facingRight = false; }
    if (goRight) { targetVX =  RUN_SPEED; this.facingRight = true;  }

    const accel = onGround ? 0.25 : 0.13;
    const newVX = body.velocity.x + (targetVX - body.velocity.x) * accel;
    body.setVelocityX(newVX);

    const isMoving = Math.abs(newVX) > 15;
    if (isMoving) this.walkT += dt;
    else          this.idleT += dt;

    // ── Block detection ───────────────────────────────────────────────
    const blockNow = this.blockUnderPlayer();
    if (blockNow !== this.activeBlock) {
      this.onBlockChange(blockNow);
      this.activeBlock = blockNow;
    }

    // ── Proximity glow (blocks light up as player approaches) ─────────
    this.updateProximityGlow();

    // ── World bounds ──────────────────────────────────────────────────
    if (this.player.x > this.worldEndX - RIGHT_TRAIL * 0.5) this.triggerEnd();

    if (this.player.y > this.scale.height + 200) {
      body.reset(this.player.x, this.groundY - CH / 2 - 2);
      body.setVelocity(0, 0);
    }

    // ── Squash decay ──────────────────────────────────────────────────
    if (this.landSquash > 0) this.landSquash = Math.max(0, this.landSquash - dt * 3.6);

    // ── Dust ──────────────────────────────────────────────────────────
    this.updateDust(dt);

    // ── Render character ──────────────────────────────────────────────
    const observing = blockNow >= 0 && !isMoving;
    this.updateCharSprite(isMoving, body.velocity.y, onGround, observing);

    this.prevTJump = this.tJump;
  }


  // ── Block under player ────────────────────────────────────────────────
  private blockUnderPlayer(): number {
    if (!this.player.body.blocked.down) return -1;
    const px = this.player.x;
    for (let i = 0; i < this.blockX.length; i++) {
      if (px >= this.blockX[i] && px <= this.blockX[i] + BW) return i;
    }
    return -1;
  }

  // ── Block transition handler ──────────────────────────────────────────
  private onBlockChange(newIdx: number) {
    if (this.activeBlock >= 0 && this.blockGlow[this.activeBlock]) {
      this.tweens.add({ targets: this.blockGlow[this.activeBlock], alpha: 0, duration: 260, ease: 'Cubic.easeOut' });
    }
    if (newIdx >= 0 && this.blockGlow[newIdx]) {
      this.tweens.add({ targets: this.blockGlow[newIdx], alpha: 1, duration: 200, ease: 'Cubic.easeOut' });
      if (newIdx !== this.shownBlock) {
        this.shownBlock = newIdx;
        this.showCard(newIdx);
      }
    } else {
      this.dismissCard(false);
    }
  }


  // ── Proximity glow: blocks gently illuminate as player approaches ─────
  private updateProximityGlow() {
    const px = this.player.x;
    for (let i = 0; i < this.blockX.length; i++) {
      if (i === this.activeBlock) continue;
      const bCenterX = this.blockX[i] + BW / 2;
      const dist     = Math.abs(px - bCenterX);
      const target   = dist < PROX_DIST
        ? Math.max(0, (1 - dist / PROX_DIST) * 0.32)
        : 0;
      const cur = this.blockGlow[i]?.alpha ?? 0;
      if (this.blockGlow[i]) {
        this.blockGlow[i].setAlpha(cur + (target - cur) * 0.08);
      }
    }
  }


  // ── Jump ──────────────────────────────────────────────────────────────
  private doJump() {
    this.player.body.setVelocityY(JUMP_VY);
    this.isJumping = true;
    this.jumpCount++;
  }


  // ══════════════════════════════════════════════════════════════════════
  //  DUST PARTICLES
  // ══════════════════════════════════════════════════════════════════════

  private spawnDust(x: number, y: number, impactVY: number) {
    const count    = impactVY > 600 ? 8 : 5;
    const strength = Math.min(impactVY / 600, 1);
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.75;
      const speed = (35 + Math.random() * 55) * strength;
      this.dustParticles.push({
        x,
        y: y + 2,
        r:  1.5 + Math.random() * 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        a:  0.30 + Math.random() * 0.18,
      });
    }
  }

  private updateDust(dt: number) {
    if (!this.dustGfx) return;
    this.dustGfx.clear();
    if (this.dustParticles.length === 0) return;

    this.dustParticles = this.dustParticles.filter(p => p.a > 0.015);
    for (const p of this.dustParticles) {
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += 140 * dt;   // gravity
      p.vx *= 0.92;       // friction
      p.a  -= dt * 1.4;
      if (p.a > 0) {
        this.dustGfx.fillStyle(0x909090, Math.max(0, p.a) * 0.65);
        this.dustGfx.fillCircle(p.x, p.y, p.r);
      }
    }
  }


  // ══════════════════════════════════════════════════════════════════════
  //  CHARACTER SPRITE
  // ══════════════════════════════════════════════════════════════════════

  private updateCharSprite(moving: boolean, vy: number, onGround: boolean, observing: boolean) {
    const g     = this.charGfx;
    g.clear();

    const px    = this.player.x;
    const feetY = this.player.y + CH / 2 - 2;

    // ── Squash & stretch ─────────────────────────────────────────────
    let sy = 1, sx = 1;
    if (this.landSquash > 0) {
      const p      = 1 - this.landSquash;
      const spring = Math.sin(p * Math.PI * 1.5);
      sy = 1 - spring * 0.28;
      sx = 1 + spring * 0.22;
    } else if (!onGround) {
      if (vy < -80) {
        const amt = Math.min(Math.abs(vy) / 720, 0.20);
        sy = 1 + amt; sx = Math.max(0.84, 1 - amt * 0.50);
      } else if (vy > 140) {
        sy = 0.97; sx = 1.03;
      }
    }

    // ── Walk bob ─────────────────────────────────────────────────────
    const walkBob = moving ? Math.abs(Math.sin(this.walkT * 9.5)) * 2.2 : 0;

    // ── Idle breathing — very subtle Y oscillation when standing still ─
    // Gives the character life even without input (key 3-second hook)
    const breathe = (onGround && !moving) ? Math.sin(this.idleT * 1.4) * 1.0 : 0;

    // ── Idle sway — very gentle X rotation when standing ──────────────
    const idleSwayAngle = (onGround && !moving && !observing)
      ? Math.sin(this.idleT * 1.1) * 0.8
      : 0;

    // ── Shadow ───────────────────────────────────────────────────────
    const jumpH  = Math.max(0, (this.groundY - CH / 2 - 2) - this.player.y);
    const sAlpha = Math.max(0, 0.09 - jumpH * 0.0007);
    const sScale = Math.max(0.4, 1 - jumpH * 0.002);
    g.fillStyle(0x000000, sAlpha);
    g.fillEllipse(px, feetY + 5, 30 * sx * sScale, 7 * sScale);

    // ── Sprite transform ─────────────────────────────────────────────
    if (this.charImg) {
      this.charImg.setPosition(px, feetY + walkBob * sy + breathe);
      this.charImg.setScale(
        sx * this.spriteBaseScale * (this.facingRight ? 1 : -1),
        sy * this.spriteBaseScale,
      );
      // Tilt: slight observing tilt OR idle sway
      const targetAngle = observing
        ? (this.facingRight ? 5 : -5)
        : idleSwayAngle;
      const curAngle = this.charImg.angle;
      this.charImg.setAngle(curAngle + (targetAngle - curAngle) * 0.12);
    }
  }


  // ══════════════════════════════════════════════════════════════════════
  //  INFO CARDS
  // ══════════════════════════════════════════════════════════════════════

  private showCard(idx: number) {
    this.dismissCard(true);

    const disc = DISC[idx];
    if (!disc) return;

    const W = this.scale.width, H = this.scale.height;
    const panelW = Math.min(W - 48, 360);
    const panelH = 100;
    const px0    = Math.round((W - panelW) / 2);
    const py0    = Math.round(H * 0.07);

    // Start slightly above and invisible → slide down + fade in
    const c = this.add.container(0, -18).setScrollFactor(0).setDepth(80).setAlpha(0);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.97);
    bg.fillRect(px0, py0, panelW, panelH);
    bg.lineStyle(1, 0x000000, 0.07);
    bg.strokeRect(px0, py0, panelW, panelH);
    // Left accent bar
    bg.fillStyle(0x111111, 1);
    bg.fillRect(px0, py0, 3, panelH);
    // Right tinted area for icon
    bg.fillStyle(0x000000, 0.012);
    bg.fillRect(px0 + panelW - 72, py0, 72, panelH);

    const numStr = String(idx + 1).padStart(2, '0');
    const num = this.add.text(px0 + 18, py0 + 14, numStr, {
      fontFamily: "'Space Mono', monospace", fontSize: '9px',
      color: '#00000028', letterSpacing: 3,
    });

    const title = this.add.text(px0 + 18, py0 + 28, disc.name, {
      fontFamily: "'Space Mono', monospace", fontSize: '20px',
      fontStyle: 'bold', color: '#111111',
    });

    const sub = this.add.text(px0 + 18, py0 + 68, disc.sub, {
      fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#00000055',
      wordWrap: { width: panelW - 96 },
    });

    const iconG = this.add.graphics();
    this.drawIcon(iconG, idx, px0 + panelW - 62, py0 + 24, 38);

    c.add([bg, num, title, sub, iconG]);
    this.revealCard = c;

    // Slide in from slightly above + fade
    this.tweens.add({
      targets: c, alpha: 1, y: 0,
      duration: 320, ease: 'Back.easeOut',
    });
  }

  private dismissCard(instant: boolean) {
    if (!this.revealCard) return;
    const c = this.revealCard;
    this.revealCard = null;
    this.tweens.killTweensOf(c);
    if (instant) {
      c.destroy();
    } else {
      this.tweens.add({
        targets: c, alpha: 0, y: -12,
        duration: 200, ease: 'Cubic.easeIn',
        onComplete: () => c.destroy(),
      });
    }
  }


  // ══════════════════════════════════════════════════════════════════════
  //  ICONS
  // ══════════════════════════════════════════════════════════════════════

  private drawIcon(g: Phaser.GameObjects.Graphics, idx: number, ox: number, oy: number, size: number) {
    const s = size, x = ox, y = oy;
    g.fillStyle(0x000000, 0.04);
    g.fillRect(x, y, s, s);

    switch (idx) {
      case 0: { // Systems — node graph
        const pts: [number, number][] = [[x + s / 2, y + 6], [x + 6, y + s - 7], [x + s - 6, y + s - 7]];
        g.lineStyle(1, 0x111111, 0.28);
        for (let i = 0; i < 3; i++) g.lineBetween(pts[i][0], pts[i][1], pts[(i + 1) % 3][0], pts[(i + 1) % 3][1]);
        for (const [nx, ny] of pts) {
          g.fillStyle(0xffffff, 1); g.fillCircle(nx, ny, 4);
          g.lineStyle(1.5, 0x111111, 0.7); g.strokeCircle(nx, ny, 4);
        }
        break;
      }
      case 1: { // Level Design — platform tiers
        g.fillStyle(0x111111, 0.55);
        g.fillRect(x + 2,  y + s - 10, 10, 4);
        g.fillRect(x + 14, y + s - 18, 10, 4);
        g.fillRect(x + 8,  y + s - 26, 8,  4);
        g.fillStyle(0x111111, 0.75);
        g.fillRect(x + 22, y + s - 28, 5, 5);
        break;
      }
      case 2: { // Combat — slash arc
        g.lineStyle(1, 0x111111, 0.22); g.strokeCircle(x + s / 2, y + s / 2 + 4, s / 3);
        g.lineStyle(2.5, 0x111111, 0.65); g.lineBetween(x + 5, y + s - 5, x + s - 5, y + 5);
        g.fillStyle(0x111111, 0.55); g.fillTriangle(x + s - 5, y + 5, x + s - 1, y + 11, x + s - 10, y + 9);
        break;
      }
      case 3: { // Progression — XP bar + dots
        g.fillStyle(0x111111, 0.1);  g.fillRect(x + 3, y + s - 11, s - 6, 6);
        g.fillStyle(0x111111, 0.65); g.fillRect(x + 3, y + s - 11, Math.round((s - 6) * 0.62), 6);
        for (let i = 0; i < 5; i++) {
          g.fillStyle(i < 3 ? 0x111111 : 0xbbbbbb, i < 3 ? 0.7 : 0.2);
          g.fillCircle(x + 5 + i * 6, y + s - 21, 3);
        }
        break;
      }
      case 4: { // Narrative — dialogue bubble
        g.lineStyle(1.5, 0x111111, 0.4); g.strokeRoundedRect(x + 2, y + 3, s - 4, 18, 3);
        g.fillStyle(0x111111, 0.5); g.fillRect(x + 6, y + 8, 14, 2); g.fillRect(x + 6, y + 12, 10, 2);
        g.lineStyle(1, 0x111111, 0.3); g.lineBetween(x + 14, y + 21, x + 10, y + 28); g.lineBetween(x + 10, y + 28, x + 18, y + 28);
        break;
      }
      case 5: { // Economy — coin stack
        for (let i = 2; i >= 0; i--) {
          g.fillStyle(0x111111, 0.1 + i * 0.12); g.fillEllipse(x + s / 2, y + s - 8 - i * 7, 20, 8);
          g.lineStyle(1, 0x111111, 0.3); g.strokeEllipse(x + s / 2, y + s - 8 - i * 7, 20, 8);
        }
        break;
      }
      case 6: { // UX — wireframe
        g.lineStyle(1.5, 0x111111, 0.35); g.strokeRect(x + 2, y + 3, s - 4, s - 6);
        g.lineStyle(1, 0x111111, 0.25);   g.lineBetween(x + 2, y + 10, x + s - 2, y + 10);
        g.fillStyle(0x111111, 0.12);
        g.fillRect(x + 4, y + 13, Math.round((s - 8) * 0.55), 5);
        g.fillRect(x + 4, y + 20, s - 8, 4);
        g.fillRect(x + 4, y + 26, Math.round((s - 8) * 0.72), 4);
        break;
      }
      case 7: { // Balancing — scale
        g.lineStyle(1.5, 0x111111, 0.5);
        g.lineBetween(x + s / 2, y + 5, x + s / 2, y + s - 4);
        g.lineBetween(x + 4, y + s - 4, x + s - 4, y + s - 4);
        g.strokeCircle(x + 8, y + s - 14, 6); g.strokeCircle(x + s - 8, y + s - 14, 6);
        g.lineBetween(x + s / 2, y + 11, x + 10, y + s - 14);
        g.lineBetween(x + s / 2, y + 11, x + s - 10, y + s - 14);
        break;
      }
      case 8: { // Iteration — circular arrow
        g.lineStyle(2, 0x111111, 0.5); g.strokeCircle(x + s / 2, y + s / 2, s / 3);
        g.fillStyle(0x111111, 0.6);
        g.fillTriangle(x + s / 2 + 1, y + s / 2 - s / 3 - 1, x + s / 2 + 7, y + s / 2 - s / 3 + 5, x + s / 2 - 5, y + s / 2 - s / 3 + 5);
        break;
      }
      case 9: { // Playtesting — controller
        g.lineStyle(1.5, 0x111111, 0.4); g.strokeRoundedRect(x + 2, y + 8, s - 4, s - 13, 5);
        g.fillStyle(0x111111, 0.5);
        g.fillCircle(x + 9, y + s / 2, 3); g.fillCircle(x + s - 9, y + s / 2, 3);
        g.fillRect(x + s / 2 - 1, y + 12, 2, 8); g.fillRect(x + s / 2 - 4, y + 14, 8, 2);
        break;
      }
    }
  }


  // ══════════════════════════════════════════════════════════════════════
  //  END SEQUENCE
  // ══════════════════════════════════════════════════════════════════════

  private triggerEnd() {
    this.endStarted = true;
    this.dismissCard(true);
    if (this.activeBlock >= 0 && this.blockGlow[this.activeBlock]) {
      this.tweens.add({ targets: this.blockGlow[this.activeBlock], alpha: 0, duration: 200 });
    }

    const W = this.scale.width, H = this.scale.height;

    const t1 = this.add.text(W / 2, H / 2, 'GAME DESIGN', {
      fontFamily: "'Space Mono', monospace", fontSize: '28px',
      fontStyle: 'bold', color: '#111111', letterSpacing: 10,
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    const t2 = this.add.text(W / 2, H / 2 + 46, 'all disciplines explored', {
      fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#00000050',
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

    this.tweens.add({ targets: [t1, t2], alpha: 1, duration: 500, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: [t1, t2], alpha: 0, duration: 400, ease: 'Cubic.easeIn', delay: 1600 });

    this.cameras.main.fadeOut(800, 255, 255, 255);
    this.time.delayedCall(900, () => {
      this.cb.onComplete({
        timeMs: Date.now() - this.startTime,
        jumps:  this.jumpCount,
        secretFound:        false,
        fragmentsCollected: 0,
      });
    });
  }
}
