import Entity from './entity';
import Spider from './entity-spider';
import Sentry from './entity-sentry';

import { play, hit } from './audio';
import { _math } from './game';
import { push_light } from './renderer';

export default class Plasma extends Entity {
  render() {
    super.render();
    push_light(this.x, 4, this.z + 6, 0.9, 0.2, 0.1, 0.04);
  }

  didCollide() {
    this.kill();
  }

  check(other) {
    if (other instanceof Spider || other instanceof Sentry) {
      play(hit);
      other.receiveDamage(this, 1);
      this.kill();
    }
  }

  protected init(angle) {
    var speed = 96;
    this.vx = _math.cos(angle) * speed;
    this.vz = _math.sin(angle) * speed;
  }
}
