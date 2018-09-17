import Entity from './entity';
import Player from './entity-player';

import { play, pickup } from './audio';

export default class Health extends Entity {
  check(other) {
    if (other instanceof Player) {
      this.kill();
      other.h += other.h < 5 ? 1 : 0;
      play(pickup);
    }
  }
}
