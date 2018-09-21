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
import { push_block, push_light } from './renderer';
import { terminal_show_notice } from './terminal';

export default class Cpu extends Entity {
  render() {
    this._animation_time += timeElapsed;

    push_block(this.x, this.z, 4, 17);
    const intensity =
      this.h === 5
        ? 0.02 + math.sin(this._animation_time * 10 + math.random() * 2) * 0.01
        : 0.01;
    push_light(this.x + 4, 4, this.z + 12, 0.2, 0.4, 1.0, intensity);
  }

  check(other) {
    if (this.h === 5 && other instanceof Player) {
      this.h = 10;
      set_cpus_rebooted(get_cpus_rebooted() + 1);

      const reboot_message = '\n\n\nREBOOTING..._' + 'SUCCESS\n';

      if (cpusTotal - get_cpus_rebooted() > 0) {
        terminal_show_notice(
          reboot_message +
            (cpusTotal - get_cpus_rebooted()) +
            ' SYSTEM(S) STILL OFFLINE',
        );
      } else {
        if (currentLevel !== 3) {
          terminal_show_notice(
            reboot_message +
              'ALL SYSTEMS ONLINE\n' +
              'TRIANGULATING POSITION FOR NEXT HOP...___' +
              'TARGET ACQUIRED\n' +
              'JUMPING...',
            next_level,
          );
        } else {
          terminal_show_notice(
            reboot_message + 'ALL SYSTEMS ONLINE',
            next_level,
          );
        }
      }

      play(beep);
    }
  }

  protected init() {
    this._animation_time = 0;
  }
}
