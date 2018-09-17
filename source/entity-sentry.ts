import Entity from './entity';
import Explosion from './entity-explosion';
import Particle from './entity-particle';
import Player from './entity-player';

import { play, explode } from './audio';
import { _math, entity_player, time_elapsed } from './game';
import { push_light, set_camera_shake } from './renderer';

export default class Sentry extends Entity {
  update() {
    var t = this;
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
        var angle = _math.atan2(
          entity_player.z - this.z,
          entity_player.x - this.x,
        );

        // prettier-ignore
        new entity_sentry_plasma_t(
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

  _spawn_particles(amount) {
    for (var i = 0; i < amount; i++) {
      var particle = new Particle(this.x, 0, this.z, 1, 30);
      particle.vx = (_math.random() - 0.5) * 128;
      particle.vy = _math.random() * 96;
      particle.vz = (_math.random() - 0.5) * 128;
    }
  }

  receiveDamage(from, amount) {
    super.receiveDamage(from, amount);
    this.vx = from.vx * 0.1;
    this.vz = from.vz * 0.1;
    this._spawn_particles(3);
  }

  kill() {
    super.kill();
    new Explosion(this.x, 0, this.z, 0, 26);
    set_camera_shake(3);
    play(explode);
  }
}

class entity_sentry_plasma_t extends Entity {
  init(angle) {
    var speed = 64;
    this.vx = _math.cos(angle) * speed;
    this.vz = _math.sin(angle) * speed;
  }

  render() {
    super.render();
    push_light(this.x, 4, this.z + 6, 1.5, 0.2, 0.1, 0.04);
  }

  didCollide() {
    this.kill();
  }

  check(other) {
    if (other instanceof Player) {
      other.receiveDamage(this, 1);
      this.kill();
    }
  }

  protected init() {
    this._select_target_counter = 0;
    this._target_x = this.x;
    this._target_z = this.z;
    this.h = 20;
  }
}
