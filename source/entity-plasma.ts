import Entity from './entity';
import Spider from './entity-spider';
import Sentry from './entity-sentry';

import { play, hit } from './audio';
import { math } from './game';
import { push_light } from './renderer';

export default class Plasma extends Entity {
  public render() {
    super.render();
    push_light(this.x, 4, this.z + 6, 0.9, 0.2, 0.1, 0.04);
  }

  public check(other) {
    if (other instanceof Spider || other instanceof Sentry) {
      play(hit);
      other.receiveDamage(this, 1);
      this.kill();
    }
  }

  protected init(angle) {
    const speed = 96;
    this.vx = math.cos(angle) * speed;
    this.vz = math.sin(angle) * speed;
  }

  protected didCollide() {
    this.kill();
  }
}
