import Entity from './entity';

import { time_elapsed } from './game';

export default class Particle extends Entity {
  update() {
    this.ay = -320;
    if (this.y < 0) {
      this.y = 0;
      this.vy = -this.vy * 0.96;
    }

    super.update();

    this._lifetime -= time_elapsed;
    if (this._lifetime < 0) {
      this.kill();
    }
  }

  protected init() {
    this._lifetime = 3;
  }
}
