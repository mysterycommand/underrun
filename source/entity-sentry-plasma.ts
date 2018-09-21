import Entity from './entity';
import Player from './entity-player';

import { _math } from './game';
import { push_light } from './renderer';

export default class SentryPlasma extends Entity {
  public check(other) {
    if (other instanceof Player) {
      other.receiveDamage(this, 1);
      this.kill();
    }
  }

  public render() {
    super.render();
    push_light(this.x, 4, this.z + 6, 1.5, 0.2, 0.1, 0.04);
  }

  protected init(angle) {
    const speed = 64;
    this.vx = _math.cos(angle) * speed;
    this.vz = _math.sin(angle) * speed;
  }

  protected didCollide() {
    this.kill();
  }
}
