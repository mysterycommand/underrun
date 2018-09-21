import {
  math,
  entities,
  entitiesToKill,
  timeElapsed,
  levelData,
  levelWidth,
} from './game';
import { push_sprite } from './renderer';

export default class Entity {
  public vx: number = 0;
  public vy: number = 0;
  public vz: number = 0;
  public h: number = 5;
  protected ax: number = 0;
  protected ay: number = 0;
  protected az: number = 0;
  protected dead: boolean = false;

  constructor(
    public x: number,
    public y: number,
    public z: number,
    protected f: number,
    protected s: number,
    opts = {},
  ) {
    this.init(opts);
    entities.push(this);
  }

  public update() {
    const t = this;
    const { x: lastX, z: lastZ } = t;

    // velocity
    t.vx += t.ax * timeElapsed - t.vx * math.min(t.f * timeElapsed, 1);
    t.vy += t.ay * timeElapsed - t.vy * math.min(t.f * timeElapsed, 1);
    t.vz += t.az * timeElapsed - t.vz * math.min(t.f * timeElapsed, 1);

    // position
    t.x += t.vx * timeElapsed;
    t.y += t.vy * timeElapsed;
    t.z += t.vz * timeElapsed;

    // check wall collissions, horizontal
    if (t.collides(t.x, lastZ)) {
      t.didCollide(t.x, t.y);
      t.x = lastX;
      t.vx = 0;
    }

    // check wall collissions, vertical
    if (t.collides(lastX, t.z)) {
      t.didCollide(t.x, t.y);
      t.z = lastZ;
      t.vz = 0;
    }
  }

  // collision against other entities
  // tslint:disable-next-line no-empty
  public check(other) {}

  public receiveDamage(from, amount) {
    this.h -= amount;
    if (this.h <= 0) {
      this.kill();
    }
  }

  public render() {
    // render
    const t = this;
    push_sprite(t.x - 1, t.y, t.z, t.s);
  }

  // separate init() method, because "constructor" cannot be uglyfied
  // tslint:disable-next-line no-empty
  protected init(opts) {}

  protected collides(x: number, z: number) {
    // tslint:disable no-bitwise
    return (
      levelData[(x >> 3) + (z >> 3) * levelWidth] > 7 || // top left
      levelData[((x + 6) >> 3) + (z >> 3) * levelWidth] > 7 || // top right
      levelData[((x + 6) >> 3) + ((z + 4) >> 3) * levelWidth] > 7 || // bottom right
      levelData[(x >> 3) + ((z + 4) >> 3) * levelWidth] > 7 // bottom left
    );
  }

  // collision against static walls
  // tslint:disable-next-line no-empty
  protected didCollide(x: number, y: number) {}

  protected kill() {
    if (!this.dead) {
      this.dead = true;
      entitiesToKill.push(this);
    }
  }
}
