import Entity from './entity';
import Player from './entity-player';
import Particle from './entity-particle';
import Explosion from './entity-explosion';

import { play, explode } from './audio';
import { math, currentPlayer, timeElapsed } from './game';
import { setCameraShake } from './renderer';

export default class Spider extends Entity {
  private animationTime: number = 0;
  private selectTargetCounter: number = 0;
  private targetX: number = this.x;
  private targetZ: number = this.z;

  public update() {
    const t = this;
    const txd = t.x - t.targetX;
    const tzd = t.z - t.targetZ;
    const xd = t.x - currentPlayer.x;
    const zd = t.z - currentPlayer.z;
    const dist = math.sqrt(xd * xd + zd * zd);

    t.selectTargetCounter -= timeElapsed;

    // select new target after a while
    if (t.selectTargetCounter < 0 && dist < 64) {
      t.selectTargetCounter = math.random() * 0.5 + 0.3;
      t.targetX = currentPlayer.x;
      t.targetZ = currentPlayer.z;
    }

    // set velocity towards target
    t.ax = math.abs(txd) > 2 ? (txd > 0 ? -160 : 160) : 0;
    t.az = math.abs(tzd) > 2 ? (tzd > 0 ? -160 : 160) : 0;

    super.update();
    this.animationTime += timeElapsed;

    // tslint:disable-next-line no-bitwise
    this.s = 27 + (((this.animationTime * 15) | 0) % 3);
  }

  public check(other) {
    // slightly bounce off from other spiders to separate them
    if (other instanceof Spider) {
      const axis =
        math.abs(other.x - this.x) > math.abs(other.z - this.z) ? 'x' : 'z';
      const amount = this[axis] > other[axis] ? 0.6 : -0.6;

      this['v' + axis] += amount;
      other['v' + axis] -= amount;
    }

    // hurt player
    else if (other instanceof Player) {
      this.vx *= -1.5;
      this.vz *= -1.5;
      other.receiveDamage(this, 1);
    }
  }

  public receiveDamage(from, amount) {
    super.receiveDamage(from, amount);
    this.vx = from.vx;
    this.vz = from.vz;
    this.spawnParticles(5);
  }

  protected kill() {
    super.kill();
    // tslint:disable-next-line no-unused-expression
    new Explosion(this.x, 0, this.z, 0, 26);
    setCameraShake(1);
    play(explode);
  }

  private spawnParticles(amount) {
    for (let i = 0; i < amount; i++) {
      // tslint:disable-next-line no-unused-expression
      const particle = new Particle(this.x, 0, this.z, 1, 30);
      particle.vx = (math.random() - 0.5) * 128;
      particle.vy = math.random() * 96;
      particle.vz = (math.random() - 0.5) * 128;
    }
  }
}
