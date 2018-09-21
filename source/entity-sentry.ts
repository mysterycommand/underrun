import Entity from './entity';
import Explosion from './entity-explosion';
import Particle from './entity-particle';
import SentryPlasma from './entity-sentry-plasma';

import { play, explode } from './audio';
import { math, currentPlayer, timeElapsed } from './game';
import { set_camera_shake } from './renderer';

export default class Sentry extends Entity {
  public h = 20;
  private selectTargetCounter = 0;
  private targetX = this.x;
  private targetZ = this.z;

  public update() {
    const t = this;

    const txd = t.x - t.targetX;
    const tzd = t.z - t.targetZ;
    const xd = t.x - currentPlayer.x;
    const zd = t.z - currentPlayer.z;
    const dist = math.sqrt(xd * xd + zd * zd);

    t.selectTargetCounter -= timeElapsed;

    // select new target after a while
    if (t.selectTargetCounter < 0) {
      if (dist < 64) {
        t.selectTargetCounter = math.random() * 0.5 + 0.3;
        t.targetX = currentPlayer.x;
        t.targetZ = currentPlayer.z;
      }
      if (dist < 48) {
        const angle = math.atan2(
          currentPlayer.z - this.z,
          currentPlayer.x - this.x,
        );

        // prettier-ignore
        // tslint:disable-next-line no-unused-expression
        new SentryPlasma(
          t.x, 0, t.z, 0, 26,
          angle + math.random() * 0.2 - 0.11,
        );
      }
    }

    // set velocity towards target
    if (dist > 24) {
      t.ax = math.abs(txd) > 2 ? (txd > 0 ? -48 : 48) : 0;
      t.az = math.abs(tzd) > 2 ? (tzd > 0 ? -48 : 48) : 0;
    } else {
      t.ax = t.az = 0;
    }

    super.update();
  }

  public receiveDamage(from, amount) {
    super.receiveDamage(from, amount);
    this.vx = from.vx * 0.1;
    this.vz = from.vz * 0.1;
    this.spawnParticles(3);
  }

  protected kill() {
    super.kill();
    // tslint:disable-next-line no-unused-expression
    new Explosion(this.x, 0, this.z, 0, 26);
    set_camera_shake(3);
    play(explode);
  }

  private spawnParticles(amount) {
    for (let i = 0; i < amount; i++) {
      const particle = new Particle(this.x, 0, this.z, 1, 30);
      particle.vx = (math.random() - 0.5) * 128;
      particle.vy = math.random() * 96;
      particle.vz = (math.random() - 0.5) * 128;
    }
  }
}
