import Entity from './entity';

import { timeElapsed } from './game';
import { push_light } from './renderer';

export default class Explosion extends Entity {
  update() {
    this.ay = -320;

    if (this.y < 0) {
      this.y = 0;
      this.vy = -this.vy * 0.96;
    }
    super.update();
    this._lifetime -= timeElapsed;
    if (this._lifetime < 0) {
      this.kill();
    }
  }

  render() {
    push_light(this.x, 4, this.z + 6, 1, 0.7, 0.3, 0.08 * (1 - this._lifetime));
  }

  protected init() {
    this._lifetime = 1;
  }
}
