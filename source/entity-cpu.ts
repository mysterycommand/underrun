import Entity from './entity';
import Player from './entity-player';

import { play, beep } from './audio';
import {
  math,
  timeElapsed,
  get_cpus_rebooted,
  set_cpus_rebooted,
  cpusTotal,
  next_level,
  currentLevel,
} from './game';
import { pushBlock, pushLight } from './renderer';
import { terminal_show_notice } from './terminal';

export default class Cpu extends Entity {
  private animationTime = 0;

  public render() {
    this.animationTime += timeElapsed;

    pushBlock(this.x, this.z, 4, 17);
    const intensity =
      this.h === 5
        ? 0.02 + math.sin(this.animationTime * 10 + math.random() * 2) * 0.01
        : 0.01;
    pushLight(this.x + 4, 4, this.z + 12, 0.2, 0.4, 1.0, intensity);
  }

  public check(other) {
    if (this.h === 5 && other instanceof Player) {
      this.h = 10;
      set_cpus_rebooted(get_cpus_rebooted() + 1);

      const rebootMessage = '\n\n\nREBOOTING..._' + 'SUCCESS\n';

      if (cpusTotal - get_cpus_rebooted() > 0) {
        terminal_show_notice(
          rebootMessage +
            (cpusTotal - get_cpus_rebooted()) +
            ' SYSTEM(S) STILL OFFLINE',
        );
      } else {
        if (currentLevel !== 3) {
          terminal_show_notice(
            rebootMessage +
              'ALL SYSTEMS ONLINE\n' +
              'TRIANGULATING POSITION FOR NEXT HOP...___' +
              'TARGET ACQUIRED\n' +
              'JUMPING...',
            next_level,
          );
        } else {
          terminal_show_notice(
            rebootMessage + 'ALL SYSTEMS ONLINE',
            next_level,
          );
        }
      }

      play(beep);
    }
  }
}
