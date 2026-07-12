import Phaser from 'phaser';

export interface RepoData {
  name: string;
  slug: string;
  desc: string;
  lang: string;
  langHex: number;
  stars: number;
  forks: number;
  stack: string[];
  github: string;
  demo: string;
  inDev?: boolean;
  thumbnail?: string;
}

// Language → GitHub dot color
const LANG_COLOR: Record<string, number> = {
  'C#':         0x512BD4,
  'GDScript':   0x355570,
  'C++':        0xf34b7d,
  'TypeScript': 0x3178c6,
  'JavaScript': 0xf1e05a,
  'Python':     0x3572A5,
  'Rust':       0xdea584,
};

export const REPOS: RepoData[] = [
  {
    name:    'the-dreamrooms',
    slug:    'the-dreamrooms',
    desc:    'First-person psychological horror — dark corridors, dreamlike rooms, and entities that hunt you.',
    lang:    'C#',
    langHex: LANG_COLOR['C#'],
    stars:   0,
    forks:   0,
    stack:   ['Unity', 'C#', 'URP'],
    github:  '',
    demo:    '',
    inDev:   true,
  },
  {
    name:    'echoes-of-the-void',
    slug:    'echoes-of-the-void',
    desc:    'Narrative horror with binaural audio systems and branching dialogue trees.',
    lang:    'C#',
    langHex: LANG_COLOR['C#'],
    stars:   24,
    forks:   5,
    stack:   ['Unity', 'C#', 'Wwise', 'Yarn Spinner'],
    github:  'https://github.com/dhuruvm',
    demo:    '',
  },
  {
    name:    'pixel-rush',
    slug:    'pixel-rush',
    desc:    'Mobile runner with procedural level generation and a live-ops economy loop.',
    lang:    'GDScript',
    langHex: LANG_COLOR['GDScript'],
    stars:   18,
    forks:   3,
    stack:   ['Godot', 'GDScript', 'Firebase'],
    github:  'https://github.com/dhuruvm',
    demo:    '',
  },
  {
    name:    'arena-tactics',
    slug:    'arena-tactics',
    desc:    'Turn-based strategy — hex-grid combat, deep skill trees, and AI opponents.',
    lang:    'C++',
    langHex: LANG_COLOR['C++'],
    stars:   41,
    forks:   9,
    stack:   ['Unreal Engine', 'C++', 'Blueprints'],
    github:  'https://github.com/dhuruvm',
    demo:    '',
  },
  {
    name:    'dhuruv-portfolio',
    slug:    'dhuruv-portfolio',
    desc:    'Interactive portfolio — a playable game built with React and Phaser.',
    lang:    'TypeScript',
    langHex: LANG_COLOR['TypeScript'],
    stars:   12,
    forks:   2,
    stack:   ['React', 'TypeScript', 'Phaser 4', 'Tailwind'],
    github:  'https://github.com/dhuruvm',
    demo:    '',
  },
];

export interface DevCallbacks {
  onRepoEnter: (idx: number) => void;
  onRepoLeave: () => void;
  onEnd: () => void;
  onBack: () => void;
}

// ─── World constants ───────────────────────────────────────────────────────
const RB_W        = 280;   // card width
const RB_H        = 148;   // card height
const RB_D        = 14;    // 3-D depth
const RB_GAP      = 120;   // walking gap between cards
const LEFT_MARGIN = 220;
const RIGHT_TRAIL = 260;

// ─── Player constants ──────────────────────────────────────────────────────
const CW        = 20;
const CH        = 44;
const RUN_SPEED = 260;
const JUMP_VY   = -640;
const MAX_FALL  = 1000;
const COYOTE_MS = 110;
const BUFFER_MS = 100;

type PhysBody = Phaser.Physics.Arcade.Body;
type PhysRect  = Phaser.GameObjects.Rectangle & { body: PhysBody };

// ─── Scene ────────────────────────────────────────────────────────────────
export class DevScene extends Phaser.Scene {
  private cb: DevCallbacks;

  private player!: PhysRect;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private platCollider: Phaser.Physics.Arcade.Collider | null = null;

  private groundY   = 0;
  private worldEndX = 0;
  private blockX: number[] = [];
  private worldObjs: Phaser.GameObjects.GameObject[] = [];

  // Container-based blocks — entire card lifts as one unit
  private blockContainers: Phaser.GameObjects.Container[] = [];
  private glowContainers:  Phaser.GameObjects.Container[] = [];
  private blockBaseY: number[] = [];

  private charGfx!: Phaser.GameObjects.Graphics;
  private walkT       = 0;
  private facingRight = true;
  private wasOnGround = false;
  private prevVY      = 0;
  private landSquash  = 0;
  private blinkClock  = 2800 + Math.random() * 1600;
  private isBlinking  = false;

  private activeBlock = -1;
  private hintDone    = false;
  private hintContainer: Phaser.GameObjects.Container | null = null;
  private endStarted  = false;

  private isJumping  = false;
  private lastGround = 0;
  private lastJump   = -9999;
  private prevTJump  = false;

  public tLeft  = false;
  public tRight = false;
  public tJump  = false;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  constructor(cb: DevCallbacks) {
    super({ key: 'DevScene' });
    this.cb = cb;
  }

  create() {
    this.cameras.main.setBackgroundColor('#ffffff');
    this.buildWorld();
    this.setupCamera();
    this.setupInput();
    this.scale.on('resize', this.onResize, this);
  }

  // ── World ─────────────────────────────────────────────────────────────────
  private buildWorld() {
    const H = this.scale.height;
    this.groundY = Math.round(H * 0.46);

    for (const o of this.worldObjs) if (o.active) o.destroy();
    this.worldObjs          = [];
    this.blockContainers    = [];
    this.glowContainers     = [];
    this.blockX             = [];
    this.blockBaseY         = [];

    if (this.platforms) this.platforms.clear(true, true);
    this.platforms = this.physics.add.staticGroup();

    this.buildBackground();

    const total = REPOS.length * RB_W + (REPOS.length - 1) * RB_GAP + LEFT_MARGIN + RIGHT_TRAIL;
    this.worldEndX = LEFT_MARGIN + total;

    this.addPlat(LEFT_MARGIN + total / 2, this.groundY, total + 400, 10);

    for (let i = 0; i < REPOS.length; i++) {
      const bx = LEFT_MARGIN + i * (RB_W + RB_GAP);
      this.blockX.push(bx);
      this.blockBaseY.push(this.groundY);
      this.buildRepoBlock(bx, this.groundY, i);
    }

    this.buildGroundLine();

    const spawnX = LEFT_MARGIN - 90;
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

    if (this.platCollider) { this.physics.world.removeCollider(this.platCollider); this.platCollider = null; }
    this.platCollider = this.physics.add.collider(
      this.player as unknown as Phaser.GameObjects.GameObject,
      this.platforms,
      undefined,
      () => this.player.body.velocity.y >= 0,
      this,
    );

    if (!this.charGfx) this.charGfx = this.add.graphics().setDepth(30);
    if (!this.hintDone) this.buildHint();
  }

  private buildBackground() {
    const H = this.scale.height, STEP = 44;
    const g = this.add.graphics().setDepth(0).setScrollFactor(0.15, 0);
    g.fillStyle(0x000000, 0.020);
    for (let x = 0; x < 7000; x += STEP)
      for (let y = 0; y < H; y += STEP)
        g.fillRect(x, y, 2, 2);
    this.worldObjs.push(g);
  }

  // ── GitHub Repo Card Block ─────────────────────────────────────────────────
  private buildRepoBlock(bx: number, topY: number, idx: number) {
    const repo = REPOS[idx];

    // ── Main container (entire card including 3D chrome) ──────────────────
    const bc = this.add.container(bx, topY).setDepth(10);
    this.blockContainers.push(bc);
    this.worldObjs.push(bc);

    // ── 3D block structure ─────────────────────────────────────────────────
    const chrome = this.add.graphics();

    // Drop shadow
    chrome.fillStyle(0x000000, 0.045);
    chrome.fillRect(7, 8, RB_W + RB_D, RB_H + 8);

    // Right face (darker grey, depth illusion)
    chrome.fillStyle(0xb0b0b0);
    chrome.fillTriangle(RB_W, 0,   RB_W + RB_D, -RB_D, RB_W + RB_D, RB_H - RB_D);
    chrome.fillTriangle(RB_W, 0,   RB_W,         RB_H,  RB_W + RB_D, RB_H - RB_D);

    // Top face (light, isometric)
    chrome.fillStyle(0xf2f2f2);
    chrome.fillTriangle(0,    0,    RB_W,         0,     RB_W + RB_D, -RB_D);
    chrome.fillTriangle(0,    0,    RB_D,        -RB_D,  RB_W + RB_D, -RB_D);

    // Front face — white card
    chrome.fillStyle(0xfcfcfc);
    chrome.fillRect(0, 0, RB_W, RB_H);

    // Left accent strip — orange for in-dev, green for public
    chrome.fillStyle(repo.inDev ? 0xf97316 : 0x1a7f37);
    chrome.fillRect(0, 0, 3, RB_H);

    // Footer background tint (stats row)
    chrome.fillStyle(0x000000, 0.02);
    chrome.fillRect(0, RB_H - 30, RB_W, 30);

    // Footer separator line
    chrome.lineStyle(1, 0xe0e0e0, 1);
    chrome.lineBetween(0, RB_H - 30, RB_W, RB_H - 30);

    // Card border
    chrome.lineStyle(1, 0xd6d6d6, 1);
    chrome.strokeRect(0, 0, RB_W, RB_H);

    // White highlight on top walk-surface edge
    chrome.lineStyle(2.5, 0xffffff, 1);
    chrome.lineBetween(2, 0, RB_W - 2, 0);

    // 3D corner lines
    chrome.lineStyle(1, 0x909090, 0.18);
    chrome.lineBetween(0,    0,    RB_D,         -RB_D);
    chrome.lineBetween(RB_W, 0,    RB_W + RB_D,  -RB_D);
    chrome.lineBetween(RB_W, RB_H, RB_W + RB_D,  RB_H - RB_D);

    bc.add(chrome);

    // ── Card Face Content ─────────────────────────────────────────────────

    // Row 1: book icon glyph + "dhuruvm / slug"
    const bookG = this.add.graphics();
    bookG.fillStyle(0x848d97, 1);
    bookG.fillRect(8, 12, 10, 12);
    bookG.fillStyle(0xfcfcfc, 1);
    bookG.fillRect(12, 12, 1, 12);
    bc.add(bookG);

    const headerText = this.add.text(22, 11, `dhuruvm / ${repo.slug}`, {
      fontFamily: "'Space Mono', monospace",
      fontSize: '9px',
      color: '#0969da',
    });
    bc.add(headerText);

    // Badge — "In Dev" (orange) or "Public" (green) top right
    const badgeColor   = repo.inDev ? 0xf97316 : 0x1a7f37;
    const badgeLabel   = repo.inDev ? 'In Dev'  : 'Public';
    const badgeHex     = repo.inDev ? '#f97316'  : '#1a7f37';
    const pubBadge = this.add.graphics();
    pubBadge.lineStyle(1, badgeColor, 0.8);
    pubBadge.strokeRoundedRect(RB_W - 52, 9, 44, 16, 8);
    bc.add(pubBadge);
    const pubLabel = this.add.text(RB_W - 30, 10, badgeLabel, {
      fontFamily: "'Inter', sans-serif",
      fontSize: '9px',
      color: badgeHex,
    }).setOrigin(0.5, 0);
    bc.add(pubLabel);

    // Row 2: repo name (bold)
    const nameText = this.add.text(8, 30, repo.name, {
      fontFamily: "'Space Mono', monospace",
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#1f2328',
    });
    bc.add(nameText);

    // Row 3: description (wrapped)
    const descText = this.add.text(8, 50, repo.desc, {
      fontFamily: "'Inter', sans-serif",
      fontSize: '10px',
      color: '#636c76',
      wordWrap: { width: RB_W - 18 },
      lineSpacing: 2,
    });
    bc.add(descText);

    // ── Footer stats row ──────────────────────────────────────────────────
    // Language dot
    const dotG = this.add.graphics();
    dotG.fillStyle(repo.langHex, 1);
    dotG.fillCircle(14, RB_H - 15, 5);
    bc.add(dotG);

    // Language name
    const langTxt = this.add.text(22, RB_H - 21, repo.lang, {
      fontFamily: "'Inter', sans-serif",
      fontSize: '9px',
      color: '#636c76',
    });
    bc.add(langTxt);

    // Star icon + count
    const starTxt = this.add.text(22 + 55, RB_H - 21, `\u2605 ${repo.stars}`, {
      fontFamily: "'Inter', sans-serif",
      fontSize: '9px',
      color: '#636c76',
    });
    bc.add(starTxt);

    // Fork icon + count
    const forkTxt = this.add.text(22 + 105, RB_H - 21, `\u22D4 ${repo.forks}`, {
      fontFamily: "'Inter', sans-serif",
      fontSize: '9px',
      color: '#636c76',
    });
    bc.add(forkTxt);

    // Index on the right (3D side face)
    const sideIdx = this.add.text(RB_W + RB_D / 2, RB_H / 2 - RB_D / 2,
      String(idx + 1).padStart(2, '0'), {
        fontFamily: "'Space Mono', monospace",
        fontSize: '8px',
        color: '#888888',
      }).setOrigin(0.5, 0.5).setAngle(-5);
    bc.add(sideIdx);

    // "REPO / 01" label above the card
    const repoLbl = this.add.text(RB_W / 2, -28, `REPO / ${String(idx + 1).padStart(2, '0')}`, {
      fontFamily: "'Space Mono', monospace",
      fontSize: '8px',
      color: '#c0c0c0',
      letterSpacing: 5,
    }).setOrigin(0.5, 1);
    bc.add(repoLbl);

    // ── Glow container (same position, higher depth) ───────────────────────
    const gc = this.add.container(bx, topY).setDepth(14).setAlpha(0);
    const glowG = this.add.graphics();
    glowG.lineStyle(2.5, 0x0969da, 0.22);
    glowG.strokeRect(0, 0, RB_W, RB_H);
    glowG.fillStyle(0x0969da, 0.035);
    glowG.fillRect(1, 1, RB_W - 2, RB_H - 2);
    gc.add(glowG);
    this.glowContainers.push(gc);
    this.worldObjs.push(gc);
  }

  private buildGroundLine() {
    const g = this.add.graphics().setDepth(8);
    g.lineStyle(1.5, 0xd0d0d0, 1);
    g.lineBetween(0, this.groundY, this.worldEndX + 200, this.groundY);
    this.worldObjs.push(g);
  }

  private addPlat(cx: number, cy: number, w: number, h: number) {
    const r = this.add.rectangle(cx, cy, w, h, 0, 0) as PhysRect;
    this.physics.add.existing(r, true);
    this.platforms.add(r, true);
  }

  // ── Hint ─────────────────────────────────────────────────────────────────
  private buildHint() {
    if (this.hintContainer) { this.hintContainer.destroy(); this.hintContainer = null; }
    const W = this.scale.width, H = this.scale.height;
    const c = this.add.container(0, 0).setScrollFactor(0).setDepth(50).setAlpha(0);
    const arrow = this.add.text(W / 2, H * 0.82, '→', {
      fontFamily: "'Space Mono', monospace", fontSize: '18px', color: '#aaaaaa',
    }).setOrigin(0.5, 0.5);
    const lbl = this.add.text(W / 2, H * 0.82 + 22, 'WALK RIGHT', {
      fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#c0c0c0', letterSpacing: 4,
    }).setOrigin(0.5, 0.5);
    c.add([arrow, lbl]);
    this.hintContainer = c;
    this.tweens.add({ targets: c, alpha: 1, duration: 700, delay: 500, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: arrow, x: W / 2 + 7, yoyo: true, repeat: -1, duration: 650, ease: 'Sine.easeInOut' });
  }

  private hideHint() {
    if (this.hintDone || !this.hintContainer) return;
    this.hintDone = true;
    const c = this.hintContainer;
    this.hintContainer = null;
    this.tweens.killTweensOf(c.list);
    this.tweens.add({ targets: c, alpha: 0, duration: 240, ease: 'Sine.easeOut', onComplete: () => c.destroy() });
  }

  // ── Camera / Input ────────────────────────────────────────────────────────
  private setupCamera() {
    this.cameras.main.startFollow(
      this.player as unknown as Phaser.GameObjects.GameObject, false, 0.08, 0.09,
    );
    this.cameras.main.setFollowOffset(-170, 30);
    this.cameras.main.setDeadzone(42, 28);
  }

  private setupInput() {
    const kb      = this.input.keyboard!;
    this.cursors  = kb.createCursorKeys();
    this.keyA     = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD     = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW     = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    kb.on('keydown-ESC', () => this.cb.onBack());
  }

  private onResize() {
    const prevX = this.player?.x ?? LEFT_MARGIN - 90;
    this.buildWorld();
    if (this.player) {
      this.player.setPosition(prevX, this.groundY - CH / 2 - 2);
      this.player.body.reset(prevX, this.groundY - CH / 2 - 2);
    }
    this.setupCamera();
    this.activeBlock = -1;
  }

  // ── Update loop ───────────────────────────────────────────────────────────
  update(time: number, delta: number) {
    if (this.endStarted) return;

    const body     = this.player.body;
    const onGround = body.blocked.down;

    if (!this.wasOnGround && onGround && this.prevVY > 230) this.landSquash = 1;
    this.wasOnGround = onGround;
    this.prevVY      = body.velocity.y;

    if (onGround) this.lastGround = time;
    const coyote = (time - this.lastGround) < COYOTE_MS;

    const justJump =
      Phaser.Input.Keyboard.JustDown(this.cursors.up)  ||
      Phaser.Input.Keyboard.JustDown(this.keyW)         ||
      Phaser.Input.Keyboard.JustDown(this.keySpace)     ||
      (this.tJump && !this.prevTJump);
    const heldJump =
      this.cursors.up.isDown || this.keyW.isDown || this.keySpace.isDown || this.tJump;

    if (justJump) this.lastJump = time;
    if ((time - this.lastJump) < BUFFER_MS && coyote) this.doJump();
    if (this.isJumping && !heldJump && body.velocity.y < -200) { body.setVelocityY(-200); this.isJumping = false; }
    if (onGround) this.isJumping = false;

    const goLeft  = this.cursors.left.isDown  || this.keyA.isDown  || this.tLeft;
    const goRight = this.cursors.right.isDown || this.keyD.isDown  || this.tRight;
    if ((goLeft || goRight) && !this.hintDone) this.hideHint();

    let targetVX = 0;
    if (goLeft)  { targetVX = -RUN_SPEED; this.facingRight = false; }
    if (goRight) { targetVX =  RUN_SPEED; this.facingRight = true;  }

    const accel = onGround ? 0.25 : 0.13;
    const newVX = body.velocity.x + (targetVX - body.velocity.x) * accel;
    body.setVelocityX(newVX);

    const isMoving = Math.abs(newVX) > 15;
    if (isMoving) this.walkT += delta / 1000;

    const blockNow = this.blockUnderPlayer();
    if (blockNow !== this.activeBlock) {
      this.onBlockChange(blockNow);
      this.activeBlock = blockNow;
    }

    if (this.player.x > this.worldEndX - RIGHT_TRAIL * 0.5) this.triggerEnd();

    if (this.player.y > this.scale.height + 200) {
      body.reset(this.player.x, this.groundY - CH / 2 - 2);
      body.setVelocity(0, 0);
    }

    if (this.landSquash > 0) this.landSquash = Math.max(0, this.landSquash - (delta / 1000) * 3.6);

    this.blinkClock -= delta;
    if (this.blinkClock <= 0) {
      this.isBlinking = !this.isBlinking;
      this.blinkClock = this.isBlinking ? 110 : 2200 + Math.random() * 2000;
    }

    const observing = blockNow >= 0 && !isMoving;
    this.drawChar(isMoving, body.velocity.y, onGround, observing);
    this.prevTJump = this.tJump;
  }

  private blockUnderPlayer(): number {
    if (!this.player.body.blocked.down) return -1;
    const px = this.player.x;
    for (let i = 0; i < this.blockX.length; i++) {
      if (px >= this.blockX[i] && px <= this.blockX[i] + RB_W) return i;
    }
    return -1;
  }

  private onBlockChange(newIdx: number) {
    // Glow fade
    if (this.activeBlock >= 0 && this.glowContainers[this.activeBlock]) {
      this.tweens.add({ targets: this.glowContainers[this.activeBlock], alpha: 0, duration: 300 });
    }
    if (newIdx >= 0 && this.glowContainers[newIdx]) {
      this.tweens.add({ targets: this.glowContainers[newIdx], alpha: 1, duration: 300 });
    }

    // Lift / lower entire card container
    this.liftBlock(this.activeBlock, false);
    this.liftBlock(newIdx, true);

    if (newIdx >= 0) this.cb.onRepoEnter(newIdx);
    else             this.cb.onRepoLeave();
  }

  private liftBlock(idx: number, up: boolean) {
    if (idx < 0 || idx >= REPOS.length) return;
    const baseY  = this.blockBaseY[idx];
    const targetY = up ? baseY - 9 : baseY;
    const bc = this.blockContainers[idx];
    const gc = this.glowContainers[idx];
    if (!bc) return;
    this.tweens.killTweensOf(bc);
    this.tweens.killTweensOf(gc);
    this.tweens.add({ targets: [bc, gc], y: targetY, duration: 350, ease: 'Back.easeOut' });
  }

  private doJump() {
    this.player.body.setVelocityY(JUMP_VY);
    this.isJumping  = true;
    this.lastJump   = -9999;
    this.lastGround = -9999;
  }

  private triggerEnd() {
    if (this.endStarted) return;
    this.endStarted = true;
    this.cb.onRepoLeave();
    this.cb.onEnd();
  }

  // ── Pixel character ───────────────────────────────────────────────────────
  private drawChar(moving: boolean, vy: number, onGround: boolean, observing: boolean) {
    const g     = this.charGfx;
    g.clear();
    const px    = this.player.x;
    const feetY = this.player.y + CH / 2 - 2;
    const t     = this.walkT;

    let sy = 1, sx = 1;
    if (this.landSquash > 0) {
      const p = 1 - this.landSquash;
      const spring = Math.sin(p * Math.PI * 1.45);
      sy = 1 - spring * 0.30; sx = 1 + spring * 0.26;
    } else if (!onGround) {
      if (vy < -80) {
        const amt = Math.min(Math.abs(vy) / 740, 0.26);
        sy = 1 + amt; sx = Math.max(0.78, 1 - amt * 0.55);
      } else if (vy > 130) { sy = 0.96; sx = 1.04; }
    }

    const swing = moving ? Math.sin(t * 9.5) : 0;
    const bob   = moving ? Math.abs(Math.sin(t * 9.5)) * 2.0 : 0;

    const bodyH = Math.round(18 * sy), legH  = Math.round(14 * sy);
    const headH = Math.round(14 * sy), bodyW = Math.round(16 * sx);
    const legW  = Math.round(7  * sx), headW = Math.round(14 * sx);

    const bodyBotY = feetY - legH + bob * sy;
    const bodyTopY = bodyBotY - bodyH;
    const headTopY = bodyTopY - headH - 2;
    const bx       = Math.round(px - bodyW / 2);

    const jumpH  = Math.max(0, (this.groundY - CH / 2 - 2) - this.player.y);
    const sAlpha = Math.max(0, 0.09 - jumpH * 0.0006);
    g.fillStyle(0x000000, sAlpha);
    g.fillEllipse(px, feetY + 4, 28 * sx, 6);

    const l1 = swing * 8, l2 = -swing * 8;
    g.fillStyle(0x2c2c2c);
    g.fillRect(Math.round(bx + 1), Math.round(feetY - legH - l1 * 0.2), legW, Math.round(legH + l1 * 0.2));
    g.fillRect(Math.round(bx + bodyW - legW - 1), Math.round(feetY - legH - l2 * 0.2), legW, Math.round(legH + l2 * 0.2));

    g.fillStyle(0x1a1a1a);
    const f1X = Math.round(bx + 1 + (this.facingRight ? swing * 2 : -swing * 2));
    const f2X = Math.round(bx + bodyW - legW - 1 - (this.facingRight ? swing * 2 : -swing * 2));
    g.fillRect(f1X - 1, Math.round(feetY - 4), legW + 2, 4);
    g.fillRect(f2X - 1, Math.round(feetY - 4), legW + 2, 4);

    g.fillStyle(0x111111);
    g.fillRect(bx, Math.round(bodyTopY), bodyW, bodyH);
    g.fillStyle(0xffffff, 0.07);
    g.fillRect(bx + 1, Math.round(bodyTopY + 1), Math.round(bodyW * 0.45), Math.round(bodyH - 2));

    const armH = Math.round(11 * sy), armW = 5;
    g.fillStyle(0x1c1c1c);
    if (observing) {
      const rxA = this.facingRight ? bx + bodyW : bx - armW;
      const rxB = this.facingRight ? bx - armW  : bx + bodyW;
      g.fillRect(rxA, Math.round(bodyTopY - 9), armW, armH + 7);
      g.fillRect(rxB, Math.round(bodyTopY + 4), armW, armH - 1);
    } else {
      const a1Y = Math.round(bodyTopY + 2 + swing * 4.5);
      const a2Y = Math.round(bodyTopY + 2 - swing * 4.5);
      const a1X = this.facingRight ? bx - armW  : bx + bodyW;
      const a2X = this.facingRight ? bx + bodyW : bx - armW;
      g.fillRect(a1X, a1Y, armW, armH);
      g.fillRect(a2X, a2Y, armW, armH);
    }

    const hx    = Math.round(px - headW / 2);
    const tilt  = observing ? -5 : 0;
    const hTopY = Math.round(headTopY + tilt);
    g.fillStyle(0x111111);
    g.fillRect(hx, hTopY, headW, headH);
    g.fillStyle(0xffffff, 0.07);
    g.fillRect(hx + 1, hTopY + 1, Math.round(headW * 0.5), 3);

    const eyeX = this.facingRight ? hx + Math.round(headW * 0.60) : hx + Math.round(headW * 0.12);
    const eyeY = hTopY + Math.round(headH * 0.35);
    if (!this.isBlinking) {
      g.fillStyle(0xffffff); g.fillRect(eyeX, eyeY, 4, Math.round(4 * sy));
      g.fillStyle(0x333333); g.fillRect(eyeX + (this.facingRight ? 1 : 0), eyeY + 1, 2, 2);
    } else {
      g.fillStyle(0x111111, 0.55);
      g.fillRect(eyeX - 1, eyeY + Math.round(headH * 0.38), 6, 2);
    }
  }
}
