import entity_t from './entity';
import entity_spider_t from './entity-spider';
import entity_sentry_t from './entity-sentry';

import { play, hit } from './audio';
import { _math } from './game';
import { push_light } from './renderer';

export default class entity_plasma_t extends entity_t {
  _init(angle) {
    var speed = 96;
    this.vx = _math.cos(angle) * speed;
    this.vz = _math.sin(angle) * speed;
  }

  _render() {
    super._render();
    push_light(this.x, 4, this.z + 6, 0.9, 0.2, 0.1, 0.04);
  }

  _did_collide() {
    this._kill();
  }

  _check(other) {
    if (other instanceof entity_spider_t || other instanceof entity_sentry_t) {
      play(hit);
      other._receive_damage(this, 1);
      this._kill();
    }
  }
}
