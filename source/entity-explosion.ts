import Entity from './entity';

import { timeElapsed } from './game';
import { pushLight } from './renderer';

export default class Explosion extends Entity {
  private lifetime = 1;

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

  public render() {
    pushLight(this.x, 4, this.z + 6, 1, 0.7, 0.3, 0.08 * (1 - this.lifetime));
  }
}
