import { random_int, random_seed, array_rand } from './random';
import {
  get_num_verts,
  set_num_verts,
  set_level_num_verts,
  set_num_lights,
  push_block,
  push_floor,
  push_sprite,
  get_camera_x,
  set_camera_x,
  get_camera_y,
  set_camera_y,
  get_camera_z,
  set_camera_z,
  get_camera_shake,
  set_camera_shake,
  renderer_prepare_frame,
  renderer_end_frame,
} from './renderer';
import { terminal_show_notice, terminal_run_outro } from './terminal';

import Entity from './entity';
import Cpu from './entity-cpu';
import Health from './entity-health';
import Player from './entity-player';
import Sentry from './entity-sentry';
import Spider from './entity-spider';

export const udef = undefined; // global undefined
export const math = Math;
export const docu = document;

let tmp: any;

export const keys = { 37: 0, 38: 0, 39: 0, 40: 0 };
export const keyUp = 38;
export const keyDown = 40;
export const keyLeft = 37;
export const keyRight = 39;
export const keyShoot = 512;
export const keyConvert = { 65: 37, 87: 38, 68: 39, 83: 40 }; // convert AWDS to left up down right
export let mouseX = 0;
export let mouseY = 0;

export let timeElapsed;
let timeLast = performance.now();

export const levelWidth = 64;
const levelHeight = 64;
export const levelData = new Uint8Array(levelWidth * levelHeight);

export let cpusTotal = 0;

let cpusRebooted = 0;
export function get_cpus_rebooted() {
  return cpusRebooted;
}
export function set_cpus_rebooted(rebooted) {
  cpusRebooted = rebooted;
}

export let currentLevel = 0;
export let currentPlayer;
export let entities: Entity[] = [];
export let entitiesToKill: Entity[] = [];

export function load_image(name, callback) {
  tmp = new Image();
  tmp.src = 'm/' + name + '.png';
  tmp.onload = callback;
}

export function next_level(callback) {
  if (currentLevel === 3) {
    entitiesToKill.push(currentPlayer);
    terminal_run_outro();
  } else {
    currentLevel++;
    load_level(currentLevel, callback);
  }
}

function load_level(id, callback) {
  random_seed(0xbadc0de1 + id);
  load_image('l' + id, function() {
    entities = [];
    set_num_verts(0);
    set_num_lights(0);

    cpusTotal = 0;
    cpusRebooted = 0;

    tmp = docu.createElement('canvas');
    tmp.width = tmp.height = levelWidth; // assume square levels
    tmp = tmp.getContext('2d');
    tmp.drawImage(this, 0, 0);
    tmp = tmp.getImageData(0, 0, levelWidth, levelHeight).data;

    for (let y = 0, index = 0; y < levelHeight; y++) {
      for (let x = 0; x < levelWidth; x++, index++) {
        // reduce to 12 bit color to accurately match
        const color_key =
          ((tmp[index * 4] >> 4) << 8) +
          ((tmp[index * 4 + 1] >> 4) << 4) +
          (tmp[index * 4 + 2] >> 4);

        if (color_key !== 0) {
          const tile = (levelData[index] =
            color_key === 0x888 // wall
              ? random_int(0, 5) < 4
                ? 8
                : random_int(8, 17)
              : // prettier-ignore
                array_rand([
                  1, 1, 1, 1, 1, 3, 3, 2, 5, 5, 5, 5, 5, 5, 7, 7, 6
                ])); // floor

          if (tile > 7) {
            // walls
            push_block(x * 8, y * 8, 4, tile - 1);
          } else if (tile > 0) {
            // floor
            push_floor(x * 8, y * 8, tile - 1);

            // enemies and items
            if (random_int(0, 16 - id * 2) == 0) {
              new Spider(x * 8, 0, y * 8, 5, 27);
            } else if (random_int(0, 100) == 0) {
              new Health(x * 8, 0, y * 8, 5, 31);
            }
          }

          // cpu
          if (color_key === 0x00f) {
            levelData[index] = 8;
            new Cpu(x * 8, 0, y * 8, 0, 18);
            cpusTotal++;
          }

          // sentry
          if (color_key === 0xf00) {
            new Sentry(x * 8, 0, y * 8, 5, 32);
          }

          // player start position (blue)
          if (color_key === 0x0f0) {
            currentPlayer = new Player(x * 8, 0, y * 8, 5, 18);
          }
        }
      }
    }

    // Remove all spiders that spawned close to the player start
    for (const e of entities) {
      if (
        e instanceof Spider &&
        math.abs(e.x - currentPlayer.x) < 64 &&
        math.abs(e.z - currentPlayer.z) < 64
      ) {
        entitiesToKill.push(e);
      }
    }

    set_camera_x(-currentPlayer.x);
    set_camera_y(-300);
    set_camera_z(-currentPlayer.z - 100);

    set_level_num_verts(get_num_verts());

    terminal_show_notice(
      'SCANNING FOR OFFLINE SYSTEMS...___' + cpusTotal + ' SYSTEMS FOUND',
    );
    callback && callback();
  });
}

export function reload_level() {
  load_level(currentLevel);
}

function preventDefault(ev) {
  ev.preventDefault();
}

docu.onkeydown = ev => {
  tmp = ev.keyCode;
  tmp = keyConvert[tmp] || tmp;
  if (keys[tmp] !== udef) {
    keys[tmp] = 1;
    preventDefault(ev);
  }
};

docu.onkeyup = ev => {
  tmp = ev.keyCode;
  tmp = keyConvert[tmp] || tmp;
  if (keys[tmp] !== udef) {
    keys[tmp] = 0;
    preventDefault(ev);
  }
};

docu.onmousemove = ev => {
  mouseX = (ev.clientX / c.clientWidth) * c.width;
  mouseY = (ev.clientY / c.clientHeight) * c.height;
};

docu.onmousedown = ev => {
  keys[keyShoot] = 1;
  preventDefault(ev);
};

docu.onmouseup = ev => {
  keys[keyShoot] = 0;
  preventDefault(ev);
};

export function game_tick() {
  const time_now = performance.now();
  timeElapsed = (time_now - timeLast) / 1000;
  timeLast = time_now;

  renderer_prepare_frame();

  // update and render entities
  for (let i = 0, e1, e2; i < entities.length; i++) {
    e1 = entities[i];
    if (e1.dead) {
      continue;
    }
    e1.update();

    // check for collisions between entities - it's quadratic and nobody cares \o/
    for (let j = i + 1; j < entities.length; j++) {
      e2 = entities[j];
      if (
        !(
          e1.x >= e2.x + 9 ||
          e1.x + 9 <= e2.x ||
          e1.z >= e2.z + 9 ||
          e1.z + 9 <= e2.z
        )
      ) {
        e1.check(e2);
        e2.check(e1);
      }
    }

    e1.render();
  }

  // center camera on player, apply damping
  set_camera_x(get_camera_x() * 0.92 - currentPlayer.x * 0.08);
  set_camera_y(get_camera_y() * 0.92 - currentPlayer.y * 0.08);
  set_camera_z(get_camera_z() * 0.92 - currentPlayer.z * 0.08);

  // add camera shake
  set_camera_shake(get_camera_shake() * 0.9);
  set_camera_x(get_camera_x() + get_camera_shake() * (math.random() - 0.5));
  set_camera_z(get_camera_z() + get_camera_shake() * (math.random() - 0.5));

  // health bar, render with plasma sprite
  for (let i = 0; i < currentPlayer.h; i++) {
    push_sprite(
      -get_camera_x() - 50 + i * 4,
      29 - get_camera_y(),
      -get_camera_z() - 30,
      26,
    );
  }

  renderer_end_frame();

  // remove dead entities
  entities = entities.filter(entity => entitiesToKill.indexOf(entity) === -1);
  entitiesToKill = [];

  requestAnimationFrame(game_tick);
}
