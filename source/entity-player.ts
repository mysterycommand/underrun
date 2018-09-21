import { play, shoot, hurt } from './audio';
import Entity from './entity';
import Plasma from './entity-plasma';
import { c, get_camera_x, push_light } from './renderer';

import {
  math,
  timeElapsed,
  keys,
  keyUp,
  keyDown,
  keyLeft,
  keyRight,
  keyShoot,
  mouseX,
  mouseY,
  reload_level,
} from './game';
import { terminal_show_notice } from './terminal';

export default class Player extends Entity {
  private bob = 0;
  private lastShot = 0;
  private lastDamage = 0;
  private frame = 0;

  public update() {
    const t = this;
    const speed = 128;

    // movement
    t.ax = keys[keyLeft] ? -speed : keys[keyRight] ? speed : 0;
    t.az = keys[keyUp] ? -speed : keys[keyDown] ? speed : 0;

    // rotation - select appropriate sprite
    const angle = math.atan2(
      mouseY - (-34 + c.height * 0.8),
      mouseX - (t.x + 6 + get_camera_x() + c.width * 0.5),
    );
    // tslint:disable-next-line no-bitwise
    t.s = (18 + (((angle / math.PI) * 4 + 10.5) % 8)) | 0;

    // bobbing
    t.bob += timeElapsed * 1.75 * (math.abs(t.vx) + math.abs(t.vz));
    t.y = math.sin(t.bob) * 0.25;

    t.lastDamage -= timeElapsed;
    t.lastShot -= timeElapsed;

    if (keys[keyShoot] && t.lastShot < 0) {
      play(shoot);
      // prettier-ignore
      // tslint:disable-next-line no-unused-expression
      new Plasma(
        t.x, 0, t.z, 0, 26,
        angle + math.random() * 0.2 - 0.11,
      );
      t.lastShot = 0.1;
    }

    super.update();
  }

  public receiveDamage(from, amount) {
    if (this.lastDamage < 0) {
      play(hurt);
      super.receiveDamage(from, amount);
      this.lastDamage = 2;
    }
  }

  public render() {
    this.frame++;
    if (this.lastDamage < 0 || this.frame % 6 < 4) {
      super.render();
    }
    push_light(this.x, 4, this.z + 6, 1, 0.5, 0, 0.04);
  }

  protected kill() {
    super.kill();
    this.y = 10;
    this.z += 5;
    terminal_show_notice('DEPLOYMENT FAILED\n' + 'RESTORING BACKUP...');
    setTimeout(reload_level, 3000);
  }
}
