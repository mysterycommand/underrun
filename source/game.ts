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
export const _math = Math;
export const _document = document;
let _temp: any;

export const keys = { 37: 0, 38: 0, 39: 0, 40: 0 };
export const key_up = 38;
export const key_down = 40;
export const key_left = 37;
export const key_right = 39;
export const key_shoot = 512;
export const key_convert = { 65: 37, 87: 38, 68: 39, 83: 40 }; // convert AWDS to left up down right
export let mouse_x = 0;
export let mouse_y = 0;

export let time_elapsed;
let time_last = performance.now();

export const level_width = 64;
const level_height = 64;
export const level_data = new Uint8Array(level_width * level_height);

export let cpus_total = 0;

let cpus_rebooted = 0;
export function get_cpus_rebooted() {
  return cpus_rebooted;
}
export function set_cpus_rebooted(rebooted) {
  cpus_rebooted = rebooted;
}

export let current_level = 0;
export let entity_player;
export let entities: Entity[] = [];
export let entitiesToKill: Entity[] = [];

export function load_image(name, callback) {
  _temp = new Image();
  _temp.src = 'm/' + name + '.png';
  _temp.onload = callback;
}

export function next_level(callback) {
  if (current_level === 3) {
    entitiesToKill.push(entity_player);
    terminal_run_outro();
  } else {
    current_level++;
    load_level(current_level, callback);
  }
}

function load_level(id, callback) {
  random_seed(0xbadc0de1 + id);
  load_image('l' + id, function() {
    entities = [];
    set_num_verts(0);
    set_num_lights(0);

    cpus_total = 0;
    cpus_rebooted = 0;

    _temp = _document.createElement('canvas');
    _temp.width = _temp.height = level_width; // assume square levels
    _temp = _temp.getContext('2d');
    _temp.drawImage(this, 0, 0);
    _temp = _temp.getImageData(0, 0, level_width, level_height).data;

    for (let y = 0, index = 0; y < level_height; y++) {
      for (let x = 0; x < level_width; x++, index++) {
        // reduce to 12 bit color to accurately match
        const color_key =
          ((_temp[index * 4] >> 4) << 8) +
          ((_temp[index * 4 + 1] >> 4) << 4) +
          (_temp[index * 4 + 2] >> 4);

        if (color_key !== 0) {
          const tile = (level_data[index] =
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
            level_data[index] = 8;
            new Cpu(x * 8, 0, y * 8, 0, 18);
            cpus_total++;
          }

          // sentry
          if (color_key === 0xf00) {
            new Sentry(x * 8, 0, y * 8, 5, 32);
          }

          // player start position (blue)
          if (color_key === 0x0f0) {
            entity_player = new Player(x * 8, 0, y * 8, 5, 18);
          }
        }
      }
    }

    // Remove all spiders that spawned close to the player start
    for (const e of entities) {
      if (
        e instanceof Spider &&
        _math.abs(e.x - entity_player.x) < 64 &&
        _math.abs(e.z - entity_player.z) < 64
      ) {
        entitiesToKill.push(e);
      }
    }

    set_camera_x(-entity_player.x);
    set_camera_y(-300);
    set_camera_z(-entity_player.z - 100);

    set_level_num_verts(get_num_verts());

    terminal_show_notice(
      'SCANNING FOR OFFLINE SYSTEMS...___' + cpus_total + ' SYSTEMS FOUND',
    );
    callback && callback();
  });
}

export function reload_level() {
  load_level(current_level);
}

function preventDefault(ev) {
  ev.preventDefault();
}

_document.onkeydown = ev => {
  _temp = ev.keyCode;
  _temp = key_convert[_temp] || _temp;
  if (keys[_temp] !== udef) {
    keys[_temp] = 1;
    preventDefault(ev);
  }
};

_document.onkeyup = ev => {
  _temp = ev.keyCode;
  _temp = key_convert[_temp] || _temp;
  if (keys[_temp] !== udef) {
    keys[_temp] = 0;
    preventDefault(ev);
  }
};

_document.onmousemove = ev => {
  mouse_x = (ev.clientX / c.clientWidth) * c.width;
  mouse_y = (ev.clientY / c.clientHeight) * c.height;
};

_document.onmousedown = ev => {
  keys[key_shoot] = 1;
  preventDefault(ev);
};

_document.onmouseup = ev => {
  keys[key_shoot] = 0;
  preventDefault(ev);
};

export function game_tick() {
  const time_now = performance.now();
  time_elapsed = (time_now - time_last) / 1000;
  time_last = time_now;

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
  set_camera_x(get_camera_x() * 0.92 - entity_player.x * 0.08);
  set_camera_y(get_camera_y() * 0.92 - entity_player.y * 0.08);
  set_camera_z(get_camera_z() * 0.92 - entity_player.z * 0.08);

  // add camera shake
  set_camera_shake(get_camera_shake() * 0.9);
  set_camera_x(get_camera_x() + get_camera_shake() * (_math.random() - 0.5));
  set_camera_z(get_camera_z() + get_camera_shake() * (_math.random() - 0.5));

  // health bar, render with plasma sprite
  for (let i = 0; i < entity_player.h; i++) {
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
