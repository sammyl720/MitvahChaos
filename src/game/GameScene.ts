import Phaser from 'phaser';
import { createArt } from './art';
import { playSound } from './audio';
import { creatureVelocity } from './behavior';
import { effectiveStats, STICKER_INFO, type EntityState, type GameSettings, type Goal, type Level, type StickerType } from './sceneTypes';
import type { Fixture } from './model';
import { findTapRoute, type Point } from './navigation';
import { platformPosition } from './platform';
import { StickerEngine } from './stickerEngine';
import { assemblePart, collectCoin, depositCoins, helpNeighbor, missionComplete, missionGoalCount, missionItems, spillSupplies, startMission, type MissionState } from './mission';

export interface SceneStatus {
  selected: EntityState | null;
  armed: StickerType | null;
  transfers: number;
  treasure: boolean;
  gem: boolean;
  goals: number;
  totalGoals: number;
  message: string;
  canUndo: boolean;
  carried: number;
  deposited: number;
  required: number;
  nearStation: boolean;
}
export interface SceneCallbacks {
  onStatus: (status: SceneStatus) => void;
  onTransfer: (sticker: StickerType, sourceKind: string, resultingStickers: StickerType[]) => void;
  onBounce: () => void;
  onComplete: (stars: number, gem: boolean, tiny: boolean) => void;
}
interface SpritePiece { sprite: Phaser.Physics.Arcade.Image; name: Phaser.GameObjects.Text; badges: Phaser.GameObjects.Text[]; shadow: Phaser.GameObjects.Ellipse }
interface SolidFixture { definition: Fixture; object: Phaser.GameObjects.Rectangle; open: boolean }
interface MovingFixture { definition: Fixture; object: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text; lastX: number }
const W = 390, H = 620;
const palette = [
  { sky: 0x98dded, ground: 0xf7e4bf, accent: 0xd18d75, dark: '#70466c' },
  { sky: 0xc0e4ff, ground: 0xb6d3ea, accent: 0x6f96ce, dark: '#4470ac' },
  { sky: 0xd4c8f5, ground: 0xbac7df, accent: 0x8998c2, dark: '#635aa1' },
  { sky: 0x2e2b6c, ground: 0x6c4aa3, accent: 0x9b6cce, dark: '#e9baff' }
];

export class GameScene extends Phaser.Scene {
  readonly engine: StickerEngine;
  private pieces = new Map<string, SpritePiece>();
  private solids: SolidFixture[] = [];
  private platforms: MovingFixture[] = [];
  private bossProps: Phaser.GameObjects.GameObject[] = [];
  private bossPhase = 0;
  private goalMarks: Phaser.GameObjects.Arc[] = [];
  private goalActive: boolean[] = [];
  private goalHistory: boolean[][] = [];
  private lastTransferTarget: string | null = null;
  private selectedId: string | null = null;
  private armed: StickerType | null = null;
  private drag: { source: string; sticker: StickerType; x: number; y: number; ghost: Phaser.GameObjects.Text } | null = null;
  private moveVector = { x: 0, y: 0 };
  private tapRoute: Point[] = [];
  private keys?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private treasure = false;
  private mission: MissionState;
  private coinSprites: { x: number; y: number; sprite: Phaser.GameObjects.Container }[] = [];
  private assemblyDisplay?: Phaser.GameObjects.Text;
  private gem = false;
  private transfers = 0;
  private completed = false;
  private completionTimer?: Phaser.Time.TimerEvent;
  private treasureIcon?: Phaser.GameObjects.Text;
  private gemIcon?: Phaser.GameObjects.Text;
  private exitGlow?: Phaser.GameObjects.Arc;
  private tutorialFinger?: Phaser.GameObjects.Text;
  private costumeMark?: Phaser.GameObjects.Text;
  private tick = 0;
  private lastBounce = 0;
  private lastCollisionSound = 0;
  private lastHazardNotice = -2000;
  private lastVisualTrail = new Map<string, number>();
  private lastMagnetVisual = 0;
  private reactUntil = new Map<string, number>();
  private stunnedUntil = new Map<string, number>();
  private bossReactUntil = 0;
  private paused = false;
  private message = '';

  constructor(readonly level: Level, private callbacks: SceneCallbacks, private settings: GameSettings, private cosmetic: string, private character: 'boy' | 'girl') {
    super({ key: 'play' });
    this.engine = new StickerEngine(level.entities, (target, nextRadius) => this.hasRoom(target, nextRadius));
    this.goalActive = level.goals.map(() => false);
    this.mission = startMission(level);
  }

  private hasRoom(target: EntityState, radius: number): boolean {
    if (target.x - radius < 12 || target.x + radius > W - 12 || target.y - radius < 33 || target.y + radius > H - 12) return false;
    return !this.solids.some(({ definition, open }) => {
      if (open || definition.kind !== 'wall') return false;
      const dx = Math.max(Math.abs(target.x - definition.x) - definition.w / 2, 0);
      const dy = Math.max(Math.abs(target.y - definition.y) - definition.h / 2, 0);
      return Math.hypot(dx, dy) < radius;
    });
  }

  create(): void {
    createArt(this);
    this.drawBackground();
    this.physics.world.setBounds(12, 34, W - 24, H - 46);
    for (const goal of this.level.goals) this.addGoal(goal);
    this.addTreasure();
    this.addExit();
    for (const entity of this.engine.all()) this.addPiece(entity);
    this.addFixtures();
    this.addMission();
    if (this.level.number === 1) {
      this.tutorialFinger = this.add.text(117, 213, '☝️', { fontSize: '27px' }).setDepth(25);
      if (!this.settings.reducedMotion) this.tweens.add({ targets: this.tutorialFinger, x: 98, y: 205, duration: 700, yoyo: true, repeat: -1 });
    }
    const values = [...this.pieces.values()].map((piece) => piece.sprite);
    for (let i = 0; i < values.length; i++) for (let j = i + 1; j < values.length; j++) {
      this.physics.add.collider(values[i], values[j], () => this.onCollision(values[i], values[j]));
    }
    this.keys = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys('W,A,S,D') as typeof this.wasd;
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.drag) this.drag.ghost.setPosition(pointer.worldX + 12, pointer.worldY - 14);
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.drag) return;
      const drag = this.drag; this.drag = null; drag.ghost.destroy();
      if (Math.hypot(pointer.worldX - drag.x, pointer.worldY - drag.y) < 18) return;
      const target = this.engine.all().find((entity) => entity.id !== drag.source && Math.hypot(pointer.worldX - entity.x, pointer.worldY - entity.y) <= effectiveStats(entity).radius + 25);
      if (target) this.attemptTransfer(drag.source, target.id, drag.sticker);
      else this.say('Drop the sticker on an object.');
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (over.length === 0 && this.settings.controlMode === 'tap') this.moveToTap({ x: pointer.worldX, y: pointer.worldY });
    });
    this.events.on('pause', () => { this.paused = true; });
    this.events.on('resume', () => { this.paused = false; });
    this.emitStatus();
  }

  private drawBackground(): void {
    const p = palette[this.level.world - 1];
    const g = this.add.graphics();
    g.fillStyle(p.sky).fillRect(0, 0, W, H);
    g.fillStyle(p.ground).fillRoundedRect(8, 33, W - 16, H - 44, 36);
    g.lineStyle(5, p.accent, 0.75).strokeRoundedRect(8, 33, W - 16, H - 44, 36);
    if (this.level.world === 1) {
      for (let i = 0; i < 7; i++) { const x = 24 + i * 56; g.fillStyle(0x80c881, .45).fillCircle(x, 151 + (i % 3) * 149, 23); g.fillStyle(0xfff2bc, .75).fillCircle(x + 10, 145 + (i % 3) * 149, 6); }
      if (this.level.number === 4) {
        g.fillStyle(0xbfc3be, .76).fillRoundedRect(70, 224, 250, 154, 12);
        for (const y of [248, 298, 348]) {
          for (const x of [91, 137, 183, 229, 275]) g.fillStyle(0xfff8dc, .8).fillRoundedRect(x, y, 24, 5, 2);
        }
      }
    } else if (this.level.world === 2) {
      for (let i = 0; i < 5; i++) { g.fillStyle(0x8eafcf, .35).fillRoundedRect(25 + i * 76, 115 + (i % 2) * 145, 42, 72, 7); g.lineStyle(3, 0xe5f7ff, .65).strokeRoundedRect(25 + i * 76, 115 + (i % 2) * 145, 42, 72, 7); }
      g.fillStyle(0xffd66e,.5).fillRect(32, 328, 326, 13);
    } else if (this.level.world === 3) {
      for (let i = 0; i < 9; i++) { g.fillStyle(0x879bc2, .28).fillRoundedRect(18 + i * 44, 110 + (i % 2) * 205, 33, 58, 5); }
      if (this.level.number === 12) g.fillStyle(0x8bd4e6,.7).fillRoundedRect(114, 344, 163, 38, 15);
    } else {
      for (let i = 0; i < 7; i++) { g.lineStyle(7, 0xe891ec, .25).strokeCircle(33 + i * 57, 168 + (i % 3) * 148, 24); g.fillStyle(0x7fe1ed, .2).fillCircle(33 + i * 57, 168 + (i % 3) * 148, 10); }
      g.lineStyle(8, 0x7ed7df, .3).lineBetween(20, 350, 369, 350);
    }
    g.fillStyle(0xffffff, .18).fillRoundedRect(18, 42, 354, 560, 30);
    this.drawWorldDetails();
    this.add.text(195, 42, `WORLD ${this.level.world}  •  ${this.level.number.toString().padStart(2, '0')}`, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '12px', color: p.dark, fontStyle: 'bold' }).setOrigin(.5).setDepth(2);
  }

  private drawWorldDetails(): void {
    // All scenery sits behind the interactive objects and leaves the middle of the arena clear.
    const g = this.add.graphics().setDepth(0);
    if (this.level.world === 1) {
      // A fictionalized block of Brooklyn brownstones frames the puzzle.
      for (const [x, brick] of [[20, 0xc78474], [316, 0xd6a07b]] as const) {
        g.fillStyle(brick).fillRoundedRect(x, 169, 54, 258, 4);
        g.fillStyle(0x754f65).fillTriangle(x - 4, 169, x + 27, 140, x + 58, 169);
        for (const y of [194, 254, 314]) {
          g.fillStyle(0xffe9bd).fillRoundedRect(x + 9, y, 14, 27, 3).fillRoundedRect(x + 31, y, 14, 27, 3);
          g.lineStyle(2, 0x77566e).strokeRoundedRect(x + 9, y, 14, 27, 3).strokeRoundedRect(x + 31, y, 14, 27, 3);
        }
        g.fillStyle(0x6d7899).fillRoundedRect(x + 19, 372, 18, 55, 3);
      }
      g.fillStyle(0xf8f1dc).fillRoundedRect(12, 542, 366, 40, 8);
      for (let x = 43; x < 370; x += 53) g.fillStyle(0xe4d3ba).fillRoundedRect(x, 560, 27, 5, 2);
      this.add.text(195, 165, this.level.number === 5 ? 'BAKERY LANE' : 'KINGSTON AVE', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '13px', color: '#5e4669', backgroundColor: '#fff5d8', padding: { x: 8, y: 4 } }).setOrigin(.5).setDepth(1);
      if (this.level.number === 3) {
        g.lineStyle(3, 0xffd279, .75);
        for (const [x, y] of [[235, 403], [151, 314], [234, 234]] as const) {
          g.lineBetween(x, y, x + 28, y);
          g.fillStyle(0xffd279, .8).fillTriangle(x + 29, y, x + 20, y - 6, x + 20, y + 6);
        }
        this.add.text(196, 171, 'SHLIACH ROUTE', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', color: '#5e4669', backgroundColor: '#fff5d8', padding: { x: 6, y: 3 } }).setOrigin(.5).setDepth(1);
      }
      if (this.level.number === 5) {
        for (const [x, y] of [[47, 276], [160, 371], [228, 332], [344, 410], [119, 434]] as const) {
          g.fillStyle(0xffffff, .52).fillCircle(x, y, 12);
          g.fillStyle(0xffffff, .37).fillCircle(x + 15, y + 6, 6);
        }
      }
    } else if (this.level.world === 2) {
      // Warm timber cottages and a cobbled lane make the village distinct from Crown Heights.
      for (const [x, width, roof] of [[17, 72, 0x9b6871], [302, 72, 0x7d7292]] as const) {
        g.fillStyle(0xe8caa3).fillRoundedRect(x, 180, width, 250, 5);
        g.fillStyle(roof).fillTriangle(x - 8, 183, x + width / 2, 139, x + width + 8, 183);
        g.fillStyle(0xcfae84).fillRoundedRect(x + 8, 196, width - 16, 224, 3);
        for (const y of [207, 273, 339]) {
          g.fillStyle(0xffefd1).fillRoundedRect(x + 15, y, 16, 25, 3).fillRoundedRect(x + 42, y, 16, 25, 3);
          g.lineStyle(2, 0x815f6c).strokeRoundedRect(x + 15, y, 16, 25, 3).strokeRoundedRect(x + 42, y, 16, 25, 3);
        }
        g.fillStyle(0x8e6f6b).fillRoundedRect(x + 28, 385, 18, 45, 3);
      }
      g.fillStyle(0xb5a9a1, .47).fillRoundedRect(22, 467, 346, 83, 12);
      for (let y = 478; y < 545; y += 18) for (let x = 33 + (Math.floor(y / 18) % 2) * 17; x < 363; x += 42) {
        g.fillStyle(0xf8ecdc, .62).fillRoundedRect(x, y, 26, 8, 4);
      }
      for (const [x, y] of [[45, 447], [340, 447]] as const) {
        g.lineStyle(5, 0x8b665d).strokeCircle(x, y, 15);
        g.lineBetween(x - 13, y, x + 13, y);
        g.lineBetween(x, y - 13, x, y + 13);
      }
      if (this.level.number === 6) this.add.text(195, 177, 'VILLAGE KITCHEN', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '12px', color: '#654f61', backgroundColor: '#fff5d9', padding: { x: 7, y: 4 } }).setOrigin(.5).setDepth(1);
      if (this.level.number === 7) this.add.text(195, 177, 'SOUP KITCHEN', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '12px', color: '#654f61', backgroundColor: '#fff5d9', padding: { x: 7, y: 4 } }).setOrigin(.5).setDepth(1);
      if (this.level.number === 8) {
        g.fillStyle(0xf5e9d2, .9).fillRoundedRect(118, 188, 153, 95, 9);
        g.lineStyle(3, 0x9e7b76).strokeRoundedRect(118, 188, 153, 95, 9);
        for (const [x, roof] of [[132, 0xbe8180], [179, 0x8b7a9c], [226, 0xc89b68]] as const) {
          g.fillStyle(0xd8af84).fillRoundedRect(x, 226, 31, 37, 3);
          g.fillStyle(roof).fillTriangle(x - 3, 226, x + 15, 207, x + 34, 226);
          g.fillStyle(0xffedba).fillRoundedRect(x + 11, 234, 9, 12, 2);
        }
        this.add.text(195, 178, 'LITTLE VILLAGE MODEL', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', color: '#654f61', backgroundColor: '#fff5d9', padding: { x: 7, y: 4 } }).setOrigin(.5).setDepth(1);
      }
      if (this.level.number === 9) {
        g.fillStyle(0xd9c190, .9).fillRoundedRect(104, 303, 180, 14, 5);
        g.fillStyle(0xd9c190, .9).fillRoundedRect(104, 405, 180, 14, 5);
        for (const x of [112, 165, 219, 273]) {
          g.fillStyle(0x9e775e).fillRoundedRect(x, 300, 7, 22, 2);
          g.fillStyle(0x9e775e).fillRoundedRect(x, 397, 7, 22, 2);
        }
        this.add.text(195, 176, 'VILLAGE STREAM', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', color: '#654f61', backgroundColor: '#fff5d9', padding: { x: 7, y: 4 } }).setOrigin(.5).setDepth(1);
      }
      if (this.level.number === 10) {
        g.fillStyle(0xd0ac7c, .8).fillRoundedRect(35, 242, 320, 121, 17);
        for (const x of [86, 302]) {
          g.fillStyle(0x8b665d).fillRoundedRect(x, 242, 9, 108, 3);
          g.fillStyle(0xf3d9a8).fillRoundedRect(x - 5, 239, 19, 10, 3);
        }
        this.add.text(195, 177, 'WAGON RESCUE ROUTE', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', color: '#654f61', backgroundColor: '#fff5d9', padding: { x: 7, y: 4 } }).setOrigin(.5).setDepth(1);
      }
    } else if (this.level.world === 3) {
      for (const x of [19, 348]) {
        g.fillStyle(0x788ab0, .65).fillRoundedRect(x, 160, 25, 374, 5);
        for (let y = 171; y < 520; y += 43) {
          g.lineStyle(2, 0xdce5f1, .55).lineBetween(x, y, x + 25, y);
          g.lineStyle(2, 0xdce5f1, .35).lineBetween(x + (Math.floor(y / 43) % 2 ? 7 : 17), y, x + (Math.floor(y / 43) % 2 ? 7 : 17), y + 40);
        }
      }
      for (const [x, y, color] of [[52, 242, 0xee819d], [303, 263, 0x78cde1]] as const) {
        g.fillStyle(0x6b538d).fillRoundedRect(x, y, 35, 48, 4);
        g.fillStyle(color).fillTriangle(x + 4, y + 5, x + 31, y + 5, x + 17, y + 39);
        g.fillStyle(0xffe9ac).fillCircle(x + 17, y + 15, 4);
      }
      for (const [x, y] of [[48, 397], [334, 408]] as const) {
        g.fillStyle(0x6a5b7e).fillRoundedRect(x - 6, y, 12, 27, 3);
        g.fillStyle(0xffe4a3, .55).fillCircle(x, y - 4, 17);
        g.fillStyle(0xffb75f).fillTriangle(x - 7, y, x, y - 24, x + 7, y);
      }
      g.fillStyle(0x735d90, .4).fillRoundedRect(145, 550, 100, 23, 4);
      g.lineStyle(3, 0xd8b578, .8).lineBetween(155, 555, 235, 555);
      if (this.level.number === 11) {
        g.fillStyle(0xe7c17d, .82).fillRoundedRect(245, 274, 113, 96, 12);
        g.lineStyle(4, 0x9b6c8e).strokeRoundedRect(245, 274, 113, 96, 12);
        for (const [x, y] of [[260, 292], [338, 292], [260, 351], [338, 351]] as const) g.fillStyle(0xfff0c9, .85).fillCircle(x, y, 6);
        g.lineStyle(3, 0xd9a1c9, .8).lineBetween(44, 182, 346, 182);
        for (let x = 56; x <= 338; x += 47) g.fillStyle(x % 2 ? 0xffd782 : 0xa8e4e7, .9).fillTriangle(x - 9, 183, x + 9, 183, x, 203);
        this.add.text(195, 170, 'DREIDEL GAME', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', color: '#624f7a', backgroundColor: '#fff5dc', padding: { x: 7, y: 4 } }).setOrigin(.5).setDepth(1);
      }
      if (this.level.number === 12) {
        g.fillStyle(0xf6e9c8, .83).fillRoundedRect(112, 173, 166, 93, 11);
        g.lineStyle(3, 0xa881a5).strokeRoundedRect(112, 173, 166, 93, 11);
        g.lineStyle(5, 0x8b73ae).lineBetween(132, 241, 258, 241);
        for (let i = 0; i < 9; i++) {
          const x = 140 + i * 14;
          const top = i === 4 ? 191 : 205;
          g.lineStyle(3, 0x8b73ae).lineBetween(x, 240, x, top + 5);
          g.fillStyle(0x8b73ae).fillRoundedRect(x - 5, top, 10, 6, 2);
        }
        this.add.text(195, 163, 'CHANUKAH DISPLAY WORKSHOP', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', color: '#624f7a', backgroundColor: '#fff5dc', padding: { x: 7, y: 4 } }).setOrigin(.5).setDepth(1);
      }
    } else {
      for (const [x, bend, color] of [[25, 127, 0x67dce6], [365, 261, 0xe599f5]] as const) {
        g.lineStyle(9, color, .5).lineBetween(x, 101, x, 525);
        g.lineStyle(6, color, .5).lineBetween(x, bend, x < 195 ? 72 : 319, bend);
        for (const y of [169, 317, 472]) g.fillStyle(0xf7edff, .8).fillCircle(x, y, 5);
      }
      for (const [x, y, color] of [[42, 231, 0x78f1e5], [309, 380, 0xf2a7f3]] as const) {
        g.fillStyle(0x4c397d).fillRoundedRect(x, y, 43, 59, 7);
        g.lineStyle(3, color).strokeRoundedRect(x + 5, y + 7, 33, 22, 4);
        g.fillStyle(color).fillRoundedRect(x + 8, y + 14, 27, 6, 3);
        g.fillStyle(0xffd97a).fillCircle(x + 13, y + 43, 4).fillCircle(x + 30, y + 43, 4);
      }
      this.addGear(53, 419, 20, 0xc48de9);
      this.addGear(339, 204, 23, 0x89e7ee);
      g.lineStyle(4, 0xffdb87, .6).lineBetween(91, 568, 301, 568);
      for (let x = 110; x < 300; x += 48) g.fillStyle(0xffdb87, .7).fillCircle(x, 568, 5);
    }
  }

  private addGear(x: number, y: number, radius: number, color: number): void {
    const gear = this.add.graphics({ x, y }).setDepth(0);
    gear.fillStyle(color, .65);
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      gear.fillRoundedRect(Math.cos(angle) * radius - 5, Math.sin(angle) * radius - 5, 10, 10, 2);
    }
    gear.fillCircle(0, 0, radius * .8);
    gear.fillStyle(0xf6e9ff, .72).fillCircle(0, 0, radius * .27);
    if (!this.settings.reducedMotion && this.settings.graphicsQuality !== 'low') this.tweens.add({ targets: gear, angle: 360, duration: 11000, repeat: -1 });
  }

  private addGoal(goal: Goal): void {
    const ring = this.add.circle(goal.x, goal.y + 8, goal.radius + 12, 0xffe186, .64).setStrokeStyle(4, 0xffffff, .85).setDepth(1);
    this.goalMarks.push(ring);
    this.add.text(goal.x, goal.y + goal.radius + 30, goal.label, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '10px', color: '#4c397d', fontStyle: 'bold', backgroundColor: '#fff8e5', padding: { x: 7, y: 3 } }).setOrigin(.5).setDepth(11);
  }
  private addTreasure(): void {
    const { x, y } = this.level.treasure;
    this.treasureIcon = this.add.text(x, y, '🎁', { fontSize: '42px' }).setOrigin(.5).setDepth(8);
    const gem = this.level.gem;
    this.gemIcon = this.add.text(gem.x, gem.y, '💎', { fontSize: '28px' }).setOrigin(.5).setDepth(8);
    if (!this.settings.reducedMotion) { this.tweens.add({ targets: [this.treasureIcon, this.gemIcon], scale: 1.12, duration: 900, yoyo: true, repeat: -1 }); }
  }
  private addMission(): void {
    if (!this.level.mission) return;
    if (this.level.mission.kind === 'neighbors') { this.addNeighborMission(); return; }
    const delivery = this.level.mission.kind === 'delivery';
    const assembly = this.level.mission.kind === 'delivery' && Boolean(this.level.mission.assembly);
    const tablecloth = this.level.mission.kind === 'delivery' && ['tablecloth', 'napkins'].includes(this.level.mission.itemName);
    const flourSacks = this.level.mission.kind === 'delivery' && this.level.mission.itemName === 'flour sacks';
    const soupSupplies = this.level.mission.kind === 'delivery' && this.level.mission.itemName === 'soup supplies';
    if (this.level.mission.kind === 'delivery' && this.level.mission.fragileZone) {
      const zone = this.level.mission.fragileZone;
      this.add.ellipse(zone.x, zone.y, zone.w, zone.h, 0xe8a45e, .85).setStrokeStyle(3, 0xffe5a8).setDepth(2);
      this.add.text(zone.x, zone.y, 'SPILL', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#6f413b' }).setOrigin(.5).setDepth(3);
    }
    this.coinSprites = missionItems(this.level).map(({ x, y }, index) => {
      const sprite = this.add.container(x, y, assembly ? [
        this.add.rectangle(0, 0, 26, 29, 0xe6cf92).setStrokeStyle(3, 0x80628e),
        this.add.circle(0, -2, 7, 0x8acbd2).setStrokeStyle(2, 0xffffff),
        this.add.text(0, 1, String(index + 1), { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '11px', color: '#564275', fontStyle: 'bold' }).setOrigin(.5)
      ] : soupSupplies ? [
        this.add.circle(0, 0, 16, index ? 0xe2aa63 : 0xe98063).setStrokeStyle(2, 0x855b59),
        this.add.text(0, 0, index ? '🥕' : '🥔', { fontSize: '20px' }).setOrigin(.5)
      ] : tablecloth ? [
        this.add.rectangle(0, 0, 31, 24, 0xf7efdb).setStrokeStyle(2, 0x8b5760),
        this.add.rectangle(0, -7, 28, 4, 0x77bfd0),
        this.add.rectangle(0, 3, 28, 3, 0x77bfd0),
        this.add.circle(0, -1, 4, 0xffcc68)
      ] : flourSacks ? [
        this.add.ellipse(0, 2, 29, 28, 0xe8d5a4).setStrokeStyle(2, 0x907252),
        this.add.rectangle(0, -10, 18, 4, 0xb28457),
        this.add.text(0, 3, 'F', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#936e49' }).setOrigin(.5)
      ] : delivery ? [
        this.add.rectangle(0, 0, 28, 25, 0xe8a76a).setStrokeStyle(2, 0x8b5760),
        this.add.rectangle(0, -2, 28, 4, 0xffd17f),
        this.add.rectangle(0, 0, 5, 24, 0xf6e4bf),
        this.add.circle(7, 6, 3, 0x6cb7c7)
      ] : [
        this.add.circle(0, 0, 15, 0xe69a3d).setStrokeStyle(2, 0x8b5760),
        this.add.circle(0, -2, 12, 0xffd36e).setStrokeStyle(2, 0xffeead),
        this.add.text(0, -2, '1', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#90566a' }).setOrigin(.5)
      ]).setDepth(14);
      if (!this.settings.reducedMotion) this.tweens.add({ targets: sprite, scale: 1.13, duration: 760, yoyo: true, repeat: -1 });
      return { x, y, sprite };
    });
    const station = this.level.mission.station;
    const stationSprite = this.add.container(station.x, station.y, assembly ? [
      this.add.rectangle(0, 15, 64, 30, 0xa87961).setStrokeStyle(3, 0x624b73),
      this.add.rectangle(0, -7, 62, 15, 0xf4dcad).setStrokeStyle(2, 0x97769b),
      this.add.circle(-20, -16, 4, 0x84c9d7), this.add.circle(0, -16, 4, 0x84c9d7), this.add.circle(20, -16, 4, 0x84c9d7)
    ] : soupSupplies ? [
      this.add.ellipse(0, 14, 60, 23, 0x625569).setStrokeStyle(3, 0x443e59),
      this.add.rectangle(0, 0, 55, 33, 0xa66c62).setStrokeStyle(3, 0x625569),
      this.add.ellipse(0, -17, 56, 17, 0xe5a456).setStrokeStyle(3, 0xffd589),
      this.add.arc(-12, -35, 8, 210, 80, false, 0x000000, 0).setStrokeStyle(2, 0xc5c5c5),
      this.add.arc(10, -39, 8, 210, 80, false, 0x000000, 0).setStrokeStyle(2, 0xc5c5c5)
    ] : flourSacks ? [
      this.add.rectangle(0, 6, 56, 47, 0xa97055).setStrokeStyle(3, 0x654b69),
      this.add.rectangle(0, -22, 61, 10, 0xf0cf94).setStrokeStyle(3, 0x654b69),
      this.add.ellipse(0, -17, 21, 9, 0xfff0d0).setStrokeStyle(2, 0x987a66),
      this.add.rectangle(0, 4, 34, 17, 0xf2deac).setStrokeStyle(2, 0x987a66)
    ] : tablecloth ? [
      this.add.rectangle(0, 10, 58, 24, 0xb68165).setStrokeStyle(3, 0x654b69),
      this.add.rectangle(-21, 30, 5, 27, 0x654b69),
      this.add.rectangle(21, 30, 5, 27, 0x654b69),
      this.add.rectangle(0, -3, 56, 9, 0xf7efdb).setStrokeStyle(2, 0x77bfd0),
      this.add.circle(0, -10, 8, 0xffd274).setStrokeStyle(2, 0xffffff)
    ] : delivery ? [
      this.add.rectangle(0, 4, 48, 53, 0x6cb7c7).setStrokeStyle(3, 0x594a79),
      this.add.rectangle(0, -25, 55, 10, 0xffca64).setStrokeStyle(3, 0x594a79),
      this.add.rectangle(0, -5, 28, 5, 0x594a79),
      this.add.rectangle(0, 12, 30, 17, 0xf7efdb).setStrokeStyle(2, 0x594a79),
      this.add.text(0, 12, '✓', { fontSize: '15px', color: '#4b7792' }).setOrigin(.5)
    ] : [
      this.add.rectangle(0, 5, 47, 47, 0x6cb7c7).setStrokeStyle(4, 0x594a79),
      this.add.rectangle(0, -22, 52, 13, 0xffca64).setStrokeStyle(3, 0x594a79),
      this.add.rectangle(0, -22, 22, 3, 0x594a79),
      this.add.circle(0, 7, 11, 0xffdf84).setStrokeStyle(2, 0xffffff),
      this.add.text(0, 7, '1', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#885874' }).setOrigin(.5)
    ]).setDepth(13).setSize(54, 61).setInteractive({ useHandCursor: true });
    stationSprite.on('pointerdown', () => this.deposit());
    if (assembly) this.assemblyDisplay = this.add.text(station.x, station.y - 43, '◇ '.repeat(missionGoalCount(this.level)).trim(), { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '13px', color: '#604c83', backgroundColor: '#fff6dc', padding: { x: 3, y: 1 } }).setOrigin(.5).setDepth(15);
    this.add.text(station.x, station.y + 36, this.level.mission.kind === 'delivery' ? this.level.mission.stationLabel : 'PUSHKA', { fontSize: '11px', color: '#5a397e', backgroundColor: '#fff7de', padding: { x: 5, y: 3 } }).setOrigin(.5).setDepth(14);
    const npc = this.level.mission.npc;
    const friend = this.add.container(npc.x, npc.y, [
      this.add.ellipse(0, 15, 37, 34, npc.name === 'DOVI' ? 0x6cadd5 : npc.name === 'GOLDA' ? 0xb38bd4 : 0xe77f9a).setStrokeStyle(2, 0x634469),
      this.add.circle(0, -5, 18, 0x553944),
      this.add.circle(0, -3, 14, 0xeec397),
      this.add.circle(-5, -6, 2, 0x47344a), this.add.circle(5, -6, 2, 0x47344a),
      this.add.arc(0, 2, 5, 15, 165, false, 0x000000, 0).setStrokeStyle(2, 0x94546b)
    ]).setDepth(12).setSize(40, 50).setInteractive({ useHandCursor: true });
    friend.on('pointerdown', () => this.say(missionComplete(this.level, this.mission) ? npc.thanks : npc.greeting));
    this.add.text(npc.x, npc.y + 27, npc.name, { fontSize: '10px', color: '#50366e', backgroundColor: '#fff7de', padding: { x: 4, y: 2 } }).setOrigin(.5).setDepth(13);
  }
  private addNeighborMission(): void {
    const mission = this.level.mission;
    if (mission?.kind !== 'neighbors') return;
    mission.people.forEach((npc, index) => {
      const shirt = index % 2 ? 0x75a9d3 : 0xe1a065;
      const friend = this.add.container(npc.x, npc.y, [
        this.add.ellipse(0, 14, 39, 35, shirt).setStrokeStyle(2, 0x634469),
        this.add.circle(0, -7, 18, 0x4b3541),
        this.add.circle(0, -5, 14, 0xeec397),
        this.add.circle(-5, -8, 2, 0x47344a), this.add.circle(5, -8, 2, 0x47344a),
        this.add.arc(0, 0, 5, 15, 165, false, 0x000000, 0).setStrokeStyle(2, 0x94546b)
      ]).setDepth(12).setSize(44, 53).setInteractive({ useHandCursor: true });
      friend.on('pointerdown', () => this.helpNeighbor(index));
      this.add.text(npc.x, npc.y + 29, npc.name, { fontSize: '10px', color: '#50366e', backgroundColor: '#fff7de', padding: { x: 4, y: 2 } }).setOrigin(.5).setDepth(13);
    });
  }
  private helpNeighbor(index: number): void {
    const mission = this.level.mission;
    const player = this.engine.get('player');
    if (mission?.kind !== 'neighbors' || !player || this.paused || this.completed) return;
    const npc = mission.people[index];
    if (!npc) return;
    if (Math.hypot(player.x - npc.x, player.y - npc.y) > 72) { this.say(`Come closer to ${npc.name}.`); return; }
    if (this.mission.collected[index]) { this.say(npc.thanks); return; }
    if (!this.goalActive[npc.needsGoal]) { this.say(npc.greeting); return; }
    this.mission = helpNeighbor(this.mission, index);
    this.burst(npc.x, npc.y, '#8ce0b1');
    playSound('goal', this.settings.effectsVolume);
    this.say(npc.thanks);
  }
  deposit(): void {
    const mission = this.level.mission;
    if (mission?.kind === 'neighbors') {
      const player = this.engine.get('player');
      if (!player) return;
      const index = mission.people.findIndex((npc, person) => !this.mission.collected[person] && Math.hypot(player.x - npc.x, player.y - npc.y) <= 72);
      if (index < 0) this.say('Come closer to a neighbor who needs help.');
      else this.helpNeighbor(index);
      return;
    }
    const station = mission?.station;
    const player = this.engine.get('player');
    if (!station || !player || this.paused || this.completed) return;
    if (Math.hypot(player.x - station.x, player.y - station.y) > 64) { this.say(mission?.kind === 'delivery' ? `Come closer to the ${mission.stationLabel.toLowerCase()}.` : 'Come closer to the pushka.'); return; }
    if (!this.mission.carried) { this.say(mission?.kind === 'delivery' ? `Find the ${mission.itemName} first!` : 'Find the runaway coins first!'); return; }
    if (mission?.kind === 'delivery' && mission.fragileZone && this.mission.carried < missionGoalCount(this.level)) { this.say('Bring all the soup supplies together, and keep them clear of the spill!'); return; }
    const count = mission?.kind === 'delivery' && mission.assembly ? 1 : this.mission.carried;
    this.mission = mission?.kind === 'delivery' && mission.assembly ? assemblePart(this.mission) : depositCoins(this.mission);
    if (mission?.kind === 'delivery' && mission.assembly) this.assemblyDisplay?.setText(`${'◆ '.repeat(this.mission.deposited)}${'◇ '.repeat(missionGoalCount(this.level) - this.mission.deposited)}`.trim());
    this.burst(station.x, station.y, '#ffd66e');
    playSound('treasure', this.settings.effectsVolume);
    this.say(missionComplete(this.level, this.mission) ? mission!.npc.thanks : mission?.kind === 'delivery' && mission.assembly ? `Display piece ${this.mission.deposited}/${missionGoalCount(this.level)} assembled!` : mission?.kind === 'delivery' ? `${count} item${count === 1 ? '' : 's'} delivered! Find the rest.` : `${count} coin${count === 1 ? '' : 's'} in the pushka! Find the rest.`);
  }
  private addExit(): void {
    const { x, y } = this.level.exit;
    this.exitGlow = this.add.circle(x, y + 13, 30, 0xffcf85, .85).setStrokeStyle(4, 0xffffff, .8).setDepth(1);
    this.add.text(x, y + 11, '🚪', { fontSize: '36px' }).setOrigin(.5).setDepth(5);
  }
  private addFixtures(): void {
    const colors = [0x70ab67, 0x6e87b6, 0x8b71b6, 0xae73cc];
    for (const definition of this.level.fixtures) {
      if (definition.kind === 'platform') {
        const object = this.add.rectangle(definition.x, definition.y, definition.w, definition.h, 0x8be3db, .9).setStrokeStyle(3, 0xffffff, .95).setDepth(2);
        const label = this.add.text(definition.x, definition.y, '↔  MOVING  ↔', { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '10px', color: '#3d4681', fontStyle: 'bold' }).setOrigin(.5).setDepth(3);
        this.platforms.push({definition, object, label, lastX: definition.x});
        continue;
      }
      if (definition.kind === 'conveyor') {
        this.add.rectangle(definition.x, definition.y, definition.w, definition.h, 0x657fc4, .65).setStrokeStyle(3, 0xe7faff, .9).setDepth(2);
        const arrow = (definition.dx ?? 0) >= 0 ? '➜' : '⬅';
        for (let x = definition.x - definition.w / 2 + 25; x < definition.x + definition.w / 2 - 10; x += 37) this.add.text(x, definition.y, arrow, { color: '#fff', fontSize: '19px' }).setOrigin(.5).setDepth(3);
        continue;
      }
      if (definition.kind === 'hazard') {
        const mud = this.level.number === 10;
        this.add.rectangle(definition.x, definition.y, definition.w, definition.h, mud ? 0x9b7860 : 0x69cbe7, .8).setStrokeStyle(4, mud ? 0xe9cc9d : 0xe4fcff, .9).setDepth(2);
        for (let x = definition.x - definition.w / 2 + 17; x < definition.x + definition.w / 2; x += 35) this.add.text(x, definition.y, '〰', { color: mud ? '#e5c598' : '#e9ffff', fontSize: '20px' }).setOrigin(.5).setDepth(3);
        continue;
      }
      const gate = definition.kind === 'gate';
      const object = this.add.rectangle(definition.x, definition.y, definition.w, definition.h, gate ? 0xffc967 : colors[this.level.world - 1], .96).setStrokeStyle(3, 0xffffff, 1).setDepth(gate ? 8 : 4);
      this.physics.add.existing(object, true);
      for (const [id, piece] of this.pieces) if (!gate || id === 'player') this.physics.add.collider(piece.sprite, object);
      this.solids.push({ definition, object, open: false });
    }
  }
  private updateFixtures(): void {
    const active = this.goalActive.filter(Boolean).length;
    for (const fixture of this.solids) {
      const shouldOpen = fixture.definition.opensAfter !== undefined && active >= fixture.definition.opensAfter;
      if (fixture.open === shouldOpen) continue;
      fixture.open = shouldOpen;
      this.tweens.killTweensOf(fixture.object);
      const body = fixture.object.body as Phaser.Physics.Arcade.StaticBody;
      if (shouldOpen) {
        body.enable = false;
        if (this.settings.reducedMotion || this.settings.graphicsQuality === 'low') fixture.object.setVisible(false);
        else this.tweens.add({ targets: fixture.object, scaleY: .05, alpha: 0, duration: 320, onComplete: () => fixture.object.setVisible(false) });
        playSound('door', this.settings.effectsVolume);
      } else {
        fixture.object.setVisible(true).setScale(1).setAlpha(1);
        body.updateFromGameObject();
        body.enable = true;
      }
    }
  }
  private updatePlatforms(): void {
    for (const platform of this.platforms) {
      const x = platformPosition(platform.definition, this.tick);
      const shift = x - platform.lastX;
      if (Math.abs(shift) < .001) continue;
      for (const entity of this.engine.all()) {
        const piece = this.pieces.get(entity.id);
        if (!piece) continue;
        if (Math.abs(piece.sprite.x - platform.lastX) > platform.definition.w / 2) continue;
        if (Math.abs(piece.sprite.y - platform.definition.y) > platform.definition.h / 2 + effectiveStats(entity).radius * .45) continue;
        piece.sprite.x = Phaser.Math.Clamp(piece.sprite.x + shift, 12 + effectiveStats(entity).radius, 378 - effectiveStats(entity).radius);
      }
      platform.object.x = x;
      platform.label.x = x;
      platform.lastX = x;
    }
  }
  private addPiece(entity: EntityState): void {
    const stats = effectiveStats(entity);
    const shadow = this.add.ellipse(entity.x, entity.y + stats.radius * .7, stats.radius * 1.9, 11, 0x30245a, .16).setDepth(3);
    const texture = entity.id === 'player' && this.character === 'girl' ? 'character-bandit-girl' : this.level.number === 20 && entity.id === this.level.bossId ? 'boss-robot' : `character-${entity.kind}`;
    const sprite = this.physics.add.image(entity.x, entity.y, texture).setDepth(5);
    if (entity.id === 'player') {
      const tints: Record<string, number> = { rainbow: 0xffc4ee, robot: 0xb5eaff, knight: 0xd4d9ff, golden: 0xffd765, chicken: 0xffeed1, 'tiny-crown': 0xebc7ff, shabbos: 0xfff4e2, courier: 0xd8f6ff, 'kindness-pin': 0xffd7e2, 'village-scarf': 0xffdfce, 'rescue-badge': 0xffedbf, 'festival-cap': 0xe9d8ff, 'blue-sash': 0xc6efff };
      if (tints[this.cosmetic]) sprite.setTint(tints[this.cosmetic]);
    }
    sprite.setInteractive({ useHandCursor: true });
    sprite.on('pointerdown', () => this.onEntityTap(entity.id));
    const name = this.add.text(entity.x, entity.y + stats.radius + 13, entity.label ?? entity.kind.toUpperCase(), { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#453465', backgroundColor: '#fff9e6', padding: { x: 5, y: 2 } }).setOrigin(.5).setDepth(10);
    if (entity.id === 'player' && this.cosmetic !== 'classic') {
      const icons: Record<string,string> = { rainbow:'🌈', robot:'🤖', knight:'🛡️', golden:'👑', chicken:'🐔', 'tiny-crown':'✨', backpack:'🎒', shabbos:'✦', courier:'🧢', 'kindness-pin':'♥', 'village-scarf':'🧣', 'rescue-badge':'🪢', 'festival-cap':'🎉', 'blue-sash':'🩵' };
      this.costumeMark = this.add.text(entity.x,entity.y - stats.radius - 15,icons[this.cosmetic] ?? '',{fontSize:'23px'}).setOrigin(.5).setDepth(11);
    }
    const piece = { sprite, name, badges: [] as Phaser.GameObjects.Text[], shadow };
    this.pieces.set(entity.id, piece);
    this.applyStats(entity.id);
    this.updateBadges(entity.id);
  }
  private applyStats(id: string): void {
    const entity = this.engine.get(id); const piece = this.pieces.get(id); if (!entity || !piece) return;
    const stats = effectiveStats(entity);
    piece.sprite.setDisplaySize(stats.radius * 2, stats.radius * 2);
    const body = piece.sprite.body as Phaser.Physics.Arcade.Body;
    // Arcade's setCircle takes source pixels, then applies the sprite scale.
    // Half the source texture width produces a collision circle matching the visible radius.
    body.setCircle(piece.sprite.width / 2);
    body.setOffset(0, 0);
    body.setMass(stats.mass);
    body.setDrag(stats.drag, stats.drag);
    body.setBounce(stats.restitution);
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(Math.max(420, stats.speed * 2));
    piece.shadow.setSize(stats.radius * 1.9, 11).setAlpha(stats.canFloat ? .09 : .2);
    if (!this.settings.reducedMotion) {
      this.tweens.add({ targets: piece.sprite, scaleX: piece.sprite.scaleX * 1.12, scaleY: piece.sprite.scaleY * .88, duration: 120, yoyo: true });
    }
  }
  private updateBadges(id: string): void {
    const entity = this.engine.get(id); const piece = this.pieces.get(id); if (!entity || !piece) return;
    piece.badges.forEach((badge) => badge.destroy()); piece.badges = [];
    entity.stickers.forEach((sticker, index) => {
      const badge = this.add.text(0, 0, `${STICKER_INFO[sticker].icon} ${sticker}`, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#30225b', backgroundColor: STICKER_INFO[sticker].color, padding: { x: 5, y: 4 } }).setOrigin(.5).setDepth(12).setInteractive({ useHandCursor: true });
      badge.setStroke('#ffffff', 2);
      badge.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.selectedId = id; this.armed = sticker; this.emitStatus(); playSound('peel', this.settings.effectsVolume);
        const ghost = this.add.text(pointer.worldX, pointer.worldY, `${STICKER_INFO[sticker].icon} ${sticker}`, { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '15px', color: '#fff', backgroundColor: '#6841c6', padding: { x: 8, y: 6 } }).setOrigin(.5).setDepth(50).setAlpha(.8);
        this.drag = { source: id, sticker, x: pointer.worldX, y: pointer.worldY, ghost };
      });
      piece.badges.push(badge);
      this.positionBadge(entity, badge, index);
    });
  }
  private positionBadge(entity: EntityState, badge: Phaser.GameObjects.Text, index: number): void {
    const radius = effectiveStats(entity).radius;
    const total = entity.stickers.length;
    badge.setPosition(entity.x + (index - (total - 1) / 2) * 68, entity.y - radius - 20);
  }
  private onEntityTap(id: string): void {
    if (this.paused || this.completed) return;
    if (this.armed && this.selectedId && id !== this.selectedId) { this.attemptTransfer(this.selectedId, id, this.armed); return; }
    this.selectedId = id; this.armed = null; this.say(`${this.engine.get(id)?.kind ?? 'Object'} selected. Choose a sticker!`);
  }
  selectSticker(sticker: StickerType): void {
    const entity = this.selectedId ? this.engine.get(this.selectedId) : undefined;
    if (entity?.stickers.includes(sticker)) { this.armed = sticker; this.say(`Now tap another object for ${sticker}.`); }
  }
  private attemptTransfer(sourceId: string, targetId: string, sticker: StickerType): void {
    const source = this.engine.get(sourceId);
    const result = this.engine.transfer(sourceId, targetId, sticker);
    if (!result.ok) { this.say(this.errorText(result.reason)); playSound('invalid', this.settings.effectsVolume); this.shake(targetId); return; }
    this.goalHistory.push([...this.goalActive]);
    if (this.goalHistory.length > this.engine.maxUndo) this.goalHistory.shift();
    this.lastTransferTarget = targetId;
    this.selectedId = result.source.stickers.length ? sourceId : null; this.armed = null; this.transfers++;
    this.applyStats(sourceId); this.applyStats(targetId);
    this.transformEffect(sourceId, sticker, false);
    this.transformEffect(targetId, sticker, true);
    this.updateBadges(sourceId); this.updateBadges(targetId);
    const launchGoal = this.level.goals.find((goal) => goal.targetId === targetId && Math.hypot(goal.x - result.target.x,goal.y - result.target.y) > goal.radius + 10);
    if (launchGoal && (sticker === 'BOUNCY' || sticker === 'SLIPPERY') && launchGoal.requires.every((value) => result.target.stickers.includes(value))) {
      const dx = launchGoal.x - result.target.x, dy = launchGoal.y - result.target.y, distance = Math.max(1,Math.hypot(dx,dy));
      this.pieces.get(targetId)?.sprite.setVelocity(dx/distance*380,dy/distance*380);
    }
    this.burst(result.target.x, result.target.y, STICKER_INFO[sticker].color);
    this.callbacks.onTransfer(sticker, source?.kind ?? '', result.target.stickers);
    playSound('attach', this.settings.effectsVolume);
    if (sticker === 'BIG') { playSound('grow', this.settings.effectsVolume); playSound('shrink', this.settings.effectsVolume * .55); }
    if (sticker === 'TINY') playSound('shrink', this.settings.effectsVolume);
    if (sourceId === this.level.bossId) this.reactBoss();
    if (this.level.number === 1) this.tutorialFinger?.setVisible(false);
    this.say(this.level.number === 1 ? 'Magnet ready! Sweep up the runaway coins.' : `${sticker} stuck to the ${result.target.kind}!`);
    this.checkGoals();
  }
  private errorText(reason: string): string {
    const messages: Record<string, string> = { duplicate: 'That sticker is already there!', full: 'Only 3 stickers fit on one object.', 'opposite-size': 'BIG and TINY do not mix!', 'no-room': 'There is no room to grow there.', 'not-eligible': 'That object cannot take stickers.' };
    return messages[reason] ?? 'That sticker cannot go there.';
  }
  private shake(id: string): void {
    const sprite = this.pieces.get(id)?.sprite;
    this.reactUntil.set(id,this.time.now+450);
    if (sprite && !this.settings.reducedMotion) this.tweens.add({ targets: sprite, angle: 12, duration: 65, yoyo: true, repeat: 2, onComplete: () => sprite.setAngle(0) });
    if (sprite && !this.settings.reducedMotion) this.popText(sprite.x, sprite.y - 54, '?', '#ffedf8');
  }
  private popText(x: number, y: number, content: string, color: string): void {
    if (this.settings.reducedMotion) return;
    const text = this.add.text(x, y, content, { fontSize: '25px', color }).setOrigin(.5).setDepth(32);
    this.tweens.add({ targets: text, y: y - 30, alpha: 0, duration: 750, onComplete: () => text.destroy() });
  }
  private transformEffect(id: string, sticker: StickerType, incoming: boolean): void {
    const piece = this.pieces.get(id);
    if (!piece || this.settings.reducedMotion) return;
    const { sprite } = piece;
    if (sticker === 'BIG' || sticker === 'TINY') {
      this.tweens.killTweensOf(sprite);
      const sx = sprite.scaleX, sy = sprite.scaleY;
      const from = sticker === 'BIG' ? incoming ? .6 : 1.35 : incoming ? 1.45 : .7;
      sprite.setScale(sx * from, sy * from);
      this.tweens.add({ targets: sprite, scaleX: sx, scaleY: sy, duration: 320, ease: incoming ? 'Back.easeOut' : 'Cubic.easeOut' });
    }
    if (!incoming) { this.popText(sprite.x, sprite.y - 60, '!', '#fff8d2'); return; }
    if (sticker === 'HEAVY') {
      this.popText(sprite.x, sprite.y + 24, '✹', '#a1865a');
      if (this.settings.graphicsQuality !== 'low') this.cameras.main.shake(100, .003);
      for (let i = -1; i <= 1; i++) {
        const dust = this.add.circle(sprite.x + i * 18, sprite.y + effectiveStats(this.engine.get(id)!).radius, 6, 0xd0aa76, .7).setDepth(4);
        this.tweens.add({ targets: dust, x: dust.x + i * 22, alpha: 0, scale: .3, duration: 400, onComplete: () => dust.destroy() });
      }
    }
    if (sticker === 'FLOATING') this.popText(sprite.x, sprite.y - 48, '☁', '#d5f8ff');
    if (sticker === 'MAGNETIC') this.popText(sprite.x, sprite.y - 48, '✧', '#ffe4ff');
    if (sticker === 'FAST') this.popText(sprite.x, sprite.y - 48, '⚡', '#fff3b1');
    if (sticker === 'SLIPPERY') this.popText(sprite.x, sprite.y + 30, '✦', '#d6ffff');
  }
  private animatePiece(entity: EntityState, piece: SpritePiece): void {
    if (this.settings.reducedMotion) return;
    const speed = Math.hypot(entity.vx, entity.vy);
    const phase = this.tick * (speed > 35 ? .018 : .003) + entity.id.length;
    if (this.time.now > (this.reactUntil.get(entity.id) ?? 0) && (entity.id !== this.level.bossId || this.time.now > this.bossReactUntil)) piece.sprite.setAngle(Math.sin(phase) * (speed > 35 ? 5 : 2));
    piece.shadow.setAlpha(effectiveStats(entity).canFloat ? .07 + Math.sin(this.tick * .005) * .025 : .17 + Math.sin(this.tick * .003) * .025);
    if (this.tick - (this.lastVisualTrail.get(entity.id) ?? 0) < (this.settings.graphicsQuality === 'low' ? 350 : 150)) return;
    if (speed < 35 && !entity.stickers.includes('FLOATING')) return;
    const mark = entity.stickers.includes('FAST') ? '⚡' : entity.stickers.includes('SLIPPERY') ? '✧' : entity.stickers.includes('FLOATING') ? '☁' : '·';
    const trail = this.add.text(entity.x - entity.vx * .035, entity.y - entity.vy * .035, mark, { fontSize: '15px', color: '#ffffff' }).setOrigin(.5).setDepth(4).setAlpha(.65);
    this.tweens.add({ targets: trail, alpha: 0, scale: .4, duration: 480, onComplete: () => trail.destroy() });
    this.lastVisualTrail.set(entity.id,this.tick);
  }
  private burst(x: number, y: number, color: string): void {
    if (this.settings.reducedMotion) return;
    const count = this.settings.graphicsQuality === 'low' ? 4 : 10;
    for (let i = 0; i < count; i++) {
      const star = this.add.circle(x, y, i % 2 ? 4 : 6, Phaser.Display.Color.HexStringToColor(color).color).setDepth(30);
      const angle = (i / count) * Math.PI * 2;
      this.tweens.add({ targets: star, x: x + Math.cos(angle) * 54, y: y + Math.sin(angle) * 54, alpha: 0, scale: .2, duration: 500, onComplete: () => star.destroy() });
    }
    if (this.settings.graphicsQuality !== 'low') this.cameras.main.shake(75, .002);
  }
  private reactBoss(): void {
    const boss = this.level.bossId ? this.pieces.get(this.level.bossId)?.sprite : null;
    if (!boss) return;
    playSound('boss', this.settings.effectsVolume);
    this.bossReactUntil = this.time.now + 700;
    if (this.settings.reducedMotion) return;
    const face = this.add.text(boss.x, boss.y - 68, ['😵', '😳', '🤯'][this.transfers % 3], { fontSize: '31px' }).setOrigin(.5).setDepth(35);
    this.tweens.add({ targets: face, y: face.y - 30, alpha: 0, duration: 900, onComplete: () => face.destroy() });
    this.tweens.add({ targets: boss, angle: 14, duration: 90, yoyo: true, repeat: 3, onComplete: () => boss.setAngle(0) });
  }
  private clearBossProps(): void {
    this.bossProps.forEach((object) => { this.tweens.killTweensOf(object); object.destroy(); });
    this.bossProps = [];
    if (this.level.bossId) {
      const boss = this.pieces.get(this.level.bossId)?.sprite;
      boss?.setVisible(true);
      if (boss?.body) boss.body.enable = true;
    }
  }
  private updateBoss(): void {
    const stage = this.goalActive.filter(Boolean).length;
    if (stage === this.bossPhase) return;
    this.clearBossProps();
    this.bossPhase = stage;
    if (!this.level.bossId || stage === 0) return;
    const boss = this.pieces.get(this.level.bossId)?.sprite;
    if (!boss) return;
    if (this.level.number === 10) {
      for (let i = -1; i <= 1; i++) this.bossProps.push(this.add.rectangle(boss.x + i * 30, boss.y, 7, 96, 0x9be5ff).setStrokeStyle(2, 0xffffff).setDepth(10));
      this.bossProps.push(this.add.text(boss.x, boss.y - 72, 'TRAPPED!', { fontSize: '15px', color: '#fff', backgroundColor: '#586ac4', padding: { x: 5, y: 3 } }).setOrigin(.5).setDepth(11));
      playSound('boss', this.settings.effectsVolume);
    }
    if (this.level.number === 5) {
      const labels = ['', 'SMALLER LOAF!', 'BOUNCE LANE!', 'AVALANCHE TAMED!'];
      this.bossProps.push(this.add.text(195, 47, labels[stage], { fontFamily: 'Trebuchet MS, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#fff9df', backgroundColor: '#935d72', padding: { x: 7, y: 4 } }).setOrigin(.5).setDepth(20));
      if (stage === 3) {
        this.bossProps.push(this.add.circle(boss.x, boss.y, 42, 0xffdc88, .22).setStrokeStyle(3, 0xffffff, .7).setDepth(4));
        playSound('boss', this.settings.effectsVolume);
      }
    }
    if (this.level.number === 15) {
      this.bossProps.push(this.add.text(boss.x, boss.y - 74, '⚔️?!', { fontSize: '24px' }).setOrigin(.5).setDepth(12));
    }
    if (this.level.number === 20) {
      if (stage < 3) {
        const labels = ['', 'SUIT SHRINKING!', 'ENGINE STALLING!'];
        this.bossProps.push(this.add.text(195, 33, labels[stage], { fontSize: '15px', color: '#fff9d5', backgroundColor: '#7654b5', padding: { x: 7, y: 3 } }).setOrigin(.5).setDepth(20));
      } else {
        boss.setVisible(false);
        if (boss.body) boss.body.enable = false;
        const pieces = ['⚙️', '🔩', '🦾', '🤖'];
        pieces.forEach((symbol, index) => {
          const angle = index * Math.PI / 2;
          const part = this.add.text(boss.x, boss.y, symbol, { fontSize: '30px' }).setOrigin(.5).setDepth(18);
          this.bossProps.push(part);
          if (!this.settings.reducedMotion) this.tweens.add({ targets: part, x: boss.x + Math.cos(angle) * 62, y: boss.y + Math.sin(angle) * 60, angle: 160, duration: 700, ease: 'Cubic.easeOut' });
        });
        this.bossProps.push(this.add.text(boss.x, boss.y, '🐔🏳️', { fontSize: '31px' }).setOrigin(.5).setDepth(21));
        if (!this.settings.reducedMotion) for (let i = 0; i < (this.settings.graphicsQuality === 'low' ? 8 : 24); i++) {
          const x = 25 + (i * 43) % 345;
          const confetti = this.add.rectangle(x, 25 + (i % 4) * 12, 7, 12, [0xffca57, 0xff80b4, 0x80e5db, 0xbf91ef][i % 4]).setDepth(24);
          this.bossProps.push(confetti);
          this.tweens.add({ targets: confetti, y: 540 + (i % 5) * 15, angle: i % 2 ? 280 : -280, duration: 1700 + i * 37, repeat: -1, onRepeat: () => confetti.setPosition(x, 20) });
        }
        playSound('boss', this.settings.effectsVolume);
      }
    }
  }
  private say(message: string): void { this.message = message; this.emitStatus(); }
  private emitStatus(): void {
    const player = this.engine.get('player');
    const mission = this.level.mission;
    const nearStation = mission?.kind === 'neighbors'
      ? mission.people.some((npc, index) => !this.mission.collected[index] && player && Math.hypot(player.x - npc.x, player.y - npc.y) <= 72)
      : Boolean(mission && player && Math.hypot(player.x - mission.station.x, player.y - mission.station.y) <= 64);
    this.callbacks.onStatus({ selected: this.selectedId ? this.engine.get(this.selectedId) ?? null : null, armed: this.armed, transfers: this.transfers, treasure: this.treasure, gem: this.gem, goals: this.goalActive.filter(Boolean).length, totalGoals: this.goalActive.length, message: this.message, canUndo: this.engine.undoCount > 0, carried: this.mission.carried, deposited: this.mission.deposited, required: missionGoalCount(this.level), nearStation: Boolean(nearStation) });
  }
  private onCollision(a: Phaser.Physics.Arcade.Image, b: Phaser.Physics.Arcade.Image): void {
    const ids = [a, b].map((sprite) => [...this.pieces].find(([, piece]) => piece.sprite === sprite)?.[0]);
    if (ids[0] && ids[1]) {
      const first = this.engine.get(ids[0])!, second = this.engine.get(ids[1])!;
      const impact = Math.hypot((a.body?.velocity.x ?? 0) - (b.body?.velocity.x ?? 0), (a.body?.velocity.y ?? 0) - (b.body?.velocity.y ?? 0));
      if (impact > 20) {
        const push = Math.min(180, effectiveStats(first).pushForce / effectiveStats(second).mass);
        const dx = b.x - a.x, dy = b.y - a.y, length = Math.max(1,Math.hypot(dx,dy));
        b.setVelocity((b.body?.velocity.x ?? 0) + dx/length*push, (b.body?.velocity.y ?? 0) + dy/length*push);
        if (impact > 95 && this.time.now - this.lastCollisionSound > 300) { this.lastCollisionSound = this.time.now; playSound('collision', this.settings.effectsVolume * .55); }
        if (impact > 125) for (const id of ids) {
          if (!id) continue;
          const entity = this.engine.get(id);
          if (!entity || !['wander', 'patrol', 'chase', 'flee'].includes(entity.behavior)) continue;
          if ((this.stunnedUntil.get(id) ?? 0) < this.time.now) this.popText(this.pieces.get(id)!.sprite.x, this.pieces.get(id)!.sprite.y - 47, '✦', '#ffed9c');
          this.stunnedUntil.set(id, this.time.now + 420);
        }
      }
    }
    if (ids.some((id) => id && this.engine.get(id)?.stickers.includes('BOUNCY'))) {
      if (this.time.now - this.lastBounce > 250) {
        this.lastBounce = this.time.now;
        this.callbacks.onBounce();
        playSound('bounce', this.settings.effectsVolume);
        for (const id of ids) {
          if (!id || !this.engine.get(id)?.stickers.includes('BOUNCY')) continue;
          const piece = this.pieces.get(id);
          if (piece && !this.settings.reducedMotion) this.tweens.add({ targets: piece.sprite, scaleX: piece.sprite.scaleX * 1.18, scaleY: piece.sprite.scaleY * .76, duration: 90, yoyo: true });
        }
      }
    }
  }
  private checkGoals(allowActivation = true): void {
    const currentStage = this.goalActive.filter(Boolean).length;
    this.level.goals.forEach((goal, index) => {
      if (!allowActivation || (this.level.goalOrder === 'sequential' && (index !== currentStage || this.lastTransferTarget !== goal.targetId))) return;
      const entity = this.engine.get(goal.targetId);
      const stats = entity ? effectiveStats(entity) : null;
      const satisfies = entity && stats && goal.requires.every((sticker) => entity.stickers.includes(sticker))
        && Math.hypot(entity.x - goal.x, entity.y - goal.y) <= goal.radius + stats.radius
        && (goal.minMass === undefined || stats.mass >= goal.minMass)
        && (goal.minSpeed === undefined || Math.hypot(entity.vx, entity.vy) >= goal.minSpeed)
        && (goal.minMagneticRadius === undefined || stats.magneticRadius >= goal.minMagneticRadius)
        && !(goal.label.includes('PLATE') && stats.canFloat);
      if (satisfies && !this.goalActive[index]) { this.goalActive[index] = true; this.goalMarks[index].setFillStyle(0x75e0ae,.85); playSound('goal',this.settings.effectsVolume); this.burst(goal.x,goal.y,'#5ddd9f'); }
      // Switches stay on once hit. FAST objects can speed away without undoing the puzzle.
    });
    const open = this.goalActive.every(Boolean);
    this.exitGlow?.setFillStyle(open ? 0x85ecb4 : 0xffcf85, .85);
    this.updateFixtures();
    this.updateBoss();
    this.emitStatus();
  }
  private moveToTap(destination: Point): void {
    const player = this.engine.get('player');
    if (!player) return;
    const obstacles = this.engine.all().filter((entity) => entity.id !== 'player').map((entity) => ({
      x: entity.x, y: entity.y, radius: effectiveStats(entity).radius
    }));
    const route = findTapRoute(
      {x: player.x, y: player.y}, destination, effectiveStats(player).radius,
      this.level.fixtures, this.goalActive.filter(Boolean).length, obstacles, effectiveStats(player).canFloat
    );
    this.tapRoute = route ?? [];
    if (!route) this.say('That way is blocked. Try a switch first!');
  }
  setJoystick(x: number, y: number): void { this.moveVector = { x, y }; if (x || y) this.tapRoute = []; }
  updateSettings(settings: GameSettings): void { this.settings = settings; }
  setPaused(value: boolean): void { this.paused = value; if (value) this.physics.pause(); else this.physics.resume(); }
  undo(): void {
    this.completionTimer?.remove(); this.completionTimer = undefined; this.completed = false;
    if (!this.engine.undo()) { this.say('Nothing to undo yet.'); return; }
    for (const entity of this.engine.all()) {
      const piece = this.pieces.get(entity.id); if (!piece) continue;
      piece.sprite.setPosition(entity.x,entity.y); piece.sprite.setVelocity(entity.vx,entity.vy);
      this.applyStats(entity.id); this.updateBadges(entity.id);
    }
    this.transfers = Math.max(0,this.transfers-1); this.armed = null; this.selectedId = null;
    this.tapRoute = [];
    this.stunnedUntil.clear();
    this.goalActive = this.goalHistory.pop() ?? this.level.goals.map(() => false);
    this.lastTransferTarget = null;
    this.goalMarks.forEach((mark,index) => mark.setFillStyle(this.goalActive[index] ? 0x75e0ae : 0xffe186, this.goalActive[index] ? .85 : .64));
    this.checkGoals(false); this.say('Last sticker move undone.');
  }
  restart(): void {
    this.completionTimer?.remove(); this.completionTimer = undefined;
    this.engine.resetLevel(); this.treasure = false; this.gem = false; this.transfers = 0; this.completed = false; this.armed = null; this.selectedId = null;
    this.mission = startMission(this.level);
    if (this.level.mission?.kind === 'delivery' && this.level.mission.assembly) this.assemblyDisplay?.setText('◇ '.repeat(missionGoalCount(this.level)).trim());
    this.coinSprites.forEach((coin, index) => { coin.x = missionItems(this.level)[index].x; coin.y = missionItems(this.level)[index].y; coin.sprite.setPosition(coin.x, coin.y).setVisible(true); });
    this.goalHistory = []; this.lastTransferTarget = null;
    this.tapRoute = [];
    this.stunnedUntil.clear();
    this.tick = 0;
    for (const platform of this.platforms) {
      platform.lastX = platform.definition.x;
      platform.object.x = platform.definition.x;
      platform.label.x = platform.definition.x;
    }
    this.treasureIcon?.setVisible(true); this.gemIcon?.setVisible(true);
    this.tutorialFinger?.setVisible(true);
    for (const entity of this.engine.all()) { const piece = this.pieces.get(entity.id); if (!piece) continue; piece.sprite.setPosition(entity.x,entity.y).setVelocity(0,0); this.applyStats(entity.id); this.updateBadges(entity.id); }
    this.goalActive = this.level.goals.map(() => false);
    this.goalMarks.forEach((mark) => mark.setFillStyle(0xffe186,.64));
    this.checkGoals(); this.say('Fresh start! Try a new sticker trick.');
  }
  update(_time: number, delta: number): void {
    if (this.paused || this.completed) return;
    this.tick += delta;
    this.updatePlatforms();
    const player = this.pieces.get('player')?.sprite; const playerState = this.engine.get('player');
    if (!player || !playerState) return;
    const stats = effectiveStats(playerState);
    let { x, y } = this.moveVector;
    if (this.keys?.left.isDown || this.wasd?.A.isDown) x = -1;
    if (this.keys?.right.isDown || this.wasd?.D.isDown) x = 1;
    if (this.keys?.up.isDown || this.wasd?.W.isDown) y = -1;
    if (this.keys?.down.isDown || this.wasd?.S.isDown) y = 1;
    if (x || y) this.tapRoute = [];
    if (!x && !y && this.tapRoute.length) {
      while (this.tapRoute.length && Math.hypot(this.tapRoute[0].x - player.x, this.tapRoute[0].y - player.y) < 3) this.tapRoute.shift();
      if (this.tapRoute.length) {
        const dx = this.tapRoute[0].x - player.x, dy = this.tapRoute[0].y - player.y;
        const distance = Math.hypot(dx, dy);
        x = dx / distance; y = dy / distance;
      }
    }
    const length = Math.max(1,Math.hypot(x,y));
    if (playerState.stickers.includes('SLIPPERY')) player.setAcceleration(x/length * stats.speed * 3, y/length * stats.speed * 3);
    else { player.setAcceleration(0,0); player.setVelocity(x/length * stats.speed, y/length * stats.speed); }
    for (const entity of this.engine.all()) {
      const piece = this.pieces.get(entity.id); if (!piece) continue;
      if (entity.id !== 'player') {
        if (this.armed) { piece.sprite.setAcceleration(0,0).setVelocity(0,0); }
        else {
          const attrs = effectiveStats(entity);
          const destination = this.level.goals.find((goal) => goal.targetId === entity.id && goal.requires.every((sticker) => entity.stickers.includes(sticker)));
          const stunned = this.time.now < (this.stunnedUntil.get(entity.id) ?? 0) || (this.level.number === 10 && entity.id === this.level.bossId && this.goalActive[0]) || (this.level.number === 5 && entity.kind === 'challah' && this.goalActive[2]);
          if (!stunned && entity.behavior === 'activate' && destination) {
            const dx = destination.x - piece.sprite.x, dy = destination.y - piece.sprite.y, distance = Math.hypot(dx,dy);
            piece.sprite.setAcceleration(0,0);
            if (distance > 8) piece.sprite.setVelocity(dx/distance*attrs.speed*1.7,dy/distance*attrs.speed*1.7);
            else piece.sprite.setVelocity(0,0);
          } else {
            const home = this.level.entities.find((candidate) => candidate.id === entity.id)!;
            const velocity = creatureVelocity(entity, home, player, this.tick, stunned);
            piece.sprite.setAcceleration(0,0);
            if (velocity) piece.sprite.setVelocity(velocity.x, velocity.y);
          }
        }
      }
      for (const fixture of this.level.fixtures) {
        if (Math.abs(piece.sprite.x - fixture.x) > fixture.w / 2 || Math.abs(piece.sprite.y - fixture.y) > fixture.h / 2) continue;
        if (fixture.kind === 'hazard' && !effectiveStats(entity).canFloat) {
          if (this.level.number === 9 && entity.id === 'player') {
            const side = piece.sprite.y < fixture.y ? -1 : 1;
            piece.sprite.y = fixture.y + side * (fixture.h / 2 + effectiveStats(entity).radius + 2);
            piece.sprite.setVelocity(0, 0);
            this.tapRoute = [];
            if (this.tick - this.lastHazardNotice > 1200) { this.lastHazardNotice = this.tick; this.say('The stream is too deep. Try FLOATING!'); }
          } else piece.sprite.setVelocity(piece.sprite.body?.velocity.x ?? 0, piece.sprite.y < fixture.y ? -105 : 105);
        }
        if (fixture.kind === 'conveyor' && !effectiveStats(entity).canFloat) piece.sprite.setVelocity((piece.sprite.body?.velocity.x ?? 0) + (fixture.dx ?? 0) * .35, (piece.sprite.body?.velocity.y ?? 0) + (fixture.dy ?? 0) * .35);
      }
      this.engine.updateMotion(entity.id,piece.sprite.x,piece.sprite.y,piece.sprite.body?.velocity.x ?? 0,piece.sprite.body?.velocity.y ?? 0);
      const updated = this.engine.get(entity.id)!;
      piece.name.setPosition(updated.x, updated.y + effectiveStats(updated).radius + 13);
      if (entity.id === 'player') this.costumeMark?.setPosition(updated.x,updated.y - effectiveStats(updated).radius - 14);
      piece.shadow.setPosition(updated.x, updated.y + effectiveStats(updated).radius * .7);
      piece.badges.forEach((badge,index) => this.positionBadge(updated,badge,index));
      this.animatePiece(updated,piece);
    }
    if (!this.armed) this.applyMagnetism();
    this.updateMission(delta);
    if (!this.treasure && Phaser.Math.Distance.Between(player.x,player.y,this.level.treasure.x,this.level.treasure.y) < 32) {
      this.treasure = true; this.treasureIcon?.setVisible(false); playSound('treasure',this.settings.effectsVolume); this.burst(player.x,player.y,'#ffcf70'); this.say('Treasure collected! Find the exit.');
    }
    if (!this.gem && Phaser.Math.Distance.Between(player.x,player.y,this.level.gem.x,this.level.gem.y) < 29) {
      this.gem = true; this.gemIcon?.setVisible(false); playSound('gem',this.settings.effectsVolume); this.say('Secret gem found!');
    }
    if (this.tick % 150 < delta) this.checkGoals();
    if (this.treasure && this.goalActive.every(Boolean) && missionComplete(this.level, this.mission) && Phaser.Math.Distance.Between(player.x,player.y,this.level.exit.x,this.level.exit.y) < 33) {
      this.completed = true; const stars = 1 + Number(this.transfers <= this.level.par) + Number(this.gem);
      playSound('win',this.settings.effectsVolume);
      if (!this.settings.reducedMotion) {
        this.burst(player.x,player.y,'#ffe47f');
        this.tweens.add({ targets: player, angle: { from: -15, to: 15 }, scaleY: player.scaleY * 1.15, duration: 130, yoyo: true, repeat: 2 });
        this.completionTimer = this.time.delayedCall(650, () => { this.completionTimer = undefined; this.callbacks.onComplete(stars,this.gem,playerState.stickers.includes('TINY')); });
      } else this.callbacks.onComplete(stars,this.gem,playerState.stickers.includes('TINY'));
    }
  }

  private updateMission(delta: number): void {
    const player = this.engine.get('player');
    const mission = this.level.mission;
    if (!player || !mission || mission.kind === 'neighbors' || (mission.kind === 'tzedakah' && !player.stickers.includes('MAGNETIC'))) return;
    if (mission.kind === 'delivery' && mission.fragileZone && this.mission.carried) {
      const zone = mission.fragileZone;
      if (Math.abs(player.x - zone.x) < zone.w / 2 + 10 && Math.abs(player.y - zone.y) < zone.h / 2 + 10) {
        this.mission = spillSupplies(this.mission);
        this.coinSprites.forEach((coin, index) => { coin.x = mission.items[index].x; coin.y = mission.items[index].y; coin.sprite.setPosition(coin.x, coin.y).setVisible(true); });
        this.burst(player.x, player.y, '#e8a45e');
        this.say('Oops, the supplies spilled! Pick them up again and go around the puddle.');
      }
    }
    const radius = mission.kind === 'tzedakah' ? effectiveStats(player).magneticRadius : 0;
    this.coinSprites.forEach((coin, index) => {
      if (this.mission.collected[index]) return;
      const dx = player.x - coin.x, dy = player.y - coin.y;
      const distance = Math.hypot(dx, dy);
      if (distance < radius && distance > 1) {
        const move = Math.min(distance, delta * .19);
        coin.x += dx / distance * move;
        coin.y += dy / distance * move;
        coin.sprite.setPosition(coin.x, coin.y);
      }
      if (Math.hypot(player.x - coin.x, player.y - coin.y) < 28) {
        this.mission = collectCoin(this.mission, index);
        coin.sprite.setVisible(false);
        playSound('gem', this.settings.effectsVolume);
        this.say(mission.kind === 'delivery' ? `${mission.itemName} in your bag. Bring it to ${mission.npc.name}!` : `${this.mission.carried} coin${this.mission.carried === 1 ? '' : 's'} in your bag. Find the pushka!`);
      }
    });
  }

  private applyMagnetism(): void {
    const forces = new Map<string,{x:number;y:number}>();
    for (const magnet of this.engine.all()) {
      const radius = effectiveStats(magnet).magneticRadius;
      if (!radius) continue;
      for (const other of this.engine.all()) {
        if (other.id === magnet.id || !['key','robot','knight','rock','boulder','crate'].includes(other.kind)) continue;
        const dx = magnet.x-other.x, dy = magnet.y-other.y, distance = Math.hypot(dx,dy);
        if (distance < 16 || distance >= radius) continue;
        const force = Math.min(135,900/Math.max(1,effectiveStats(other).mass));
        const current = forces.get(other.id) ?? {x:0,y:0};
        forces.set(other.id,{x:current.x+dx/distance*force,y:current.y+dy/distance*force});
        if (!this.settings.reducedMotion && this.settings.graphicsQuality !== 'low' && this.tick - this.lastMagnetVisual > 280) {
          const spark = this.add.circle(other.x, other.y, 4, 0xf3a7fa).setDepth(16);
          this.tweens.add({ targets: spark, x: magnet.x, y: magnet.y, alpha: 0, duration: 260, onComplete: () => spark.destroy() });
          this.lastMagnetVisual = this.tick;
        }
      }
    }
    for (const [id,force] of forces) {
      const sprite = this.pieces.get(id)?.sprite; if (!sprite) continue;
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      const length = Math.max(1,Math.hypot(force.x,force.y));
      sprite.setAcceleration(body.acceleration.x + force.x/length*Math.min(135,length),body.acceleration.y + force.y/length*Math.min(135,length));
    }
  }
}
