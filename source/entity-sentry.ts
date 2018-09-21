import Entity from './entity';
import Explosion from './entity-explosion';
import Particle from './entity-particle';
import SentryPlasma from './entity-sentry-plasma';

import { play, explode } from './audio';
import { _math, entity_player, time_elapsed } from './game';
import { set_camera_shake } from './renderer';

export default class Sentry extends Entity {
  public update() {
    const t = this;

    const txd = t.x - t._target_x;
    const tzd = t.z - t._target_z;
    const xd = t.x - entity_player.x;
    const zd = t.z - entity_player.z;
    const dist = _math.sqrt(xd * xd + zd * zd);

    t._select_target_counter -= time_elapsed;

    // select new target after a while
    if (t._select_target_counter < 0) {
      if (dist < 64) {
        t._select_target_counter = _math.random() * 0.5 + 0.3;
        t._target_x = entity_player.x;
        t._target_z = entity_player.z;
      }
      if (dist < 48) {
        const angle = _math.atan2(
          entity_player.z - this.z,
          entity_player.x - this.x,
        );

        // prettier-ignore
        new SentryPlasma(
          t.x, 0, t.z, 0, 26,
          angle + _math.random() * 0.2 - 0.11,
        );
      }
    }

    // set velocity towards target
    if (dist > 24) {
      t.ax = _math.abs(txd) > 2 ? (txd > 0 ? -48 : 48) : 0;
      t.az = _math.abs(tzd) > 2 ? (tzd > 0 ? -48 : 48) : 0;
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

  protected init() {
    this._select_target_counter = 0;
    this._target_x = this.x;
    this._target_z = this.z;
    this.h = 20;
  }

  protected kill() {
    super.kill();
    new Explosion(this.x, 0, this.z, 0, 26);
    set_camera_shake(3);
    play(explode);
  }

  private spawnParticles(amount) {
    for (let i = 0; i < amount; i++) {
      const particle = new Particle(this.x, 0, this.z, 1, 30);
      particle.vx = (_math.random() - 0.5) * 128;
      particle.vy = _math.random() * 96;
      particle.vz = (_math.random() - 0.5) * 128;
    }
  }
}
