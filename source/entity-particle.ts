import Entity from './entity';

import { timeElapsed } from './game';

export default class Particle extends Entity {
  private lifetime = 3;

  public update() {
    this.ay = -320;
    if (this.y < 0) {
      this.y = 0;
      this.vy = -this.vy * 0.96;
    }

    super.update();

    this.lifetime -= timeElapsed;
    if (this.lifetime < 0) {
      this.kill();
    }
  }
}
