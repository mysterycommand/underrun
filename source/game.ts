import { randomInt, randomSeed, randomArray } from './random';
import {
  c,
  getNumVerts,
  setNumVerts,
  setLevelNumVerts,
  setNumLights,
  pushBlock,
  pushFloor,
  pushSprite,
  getCameraX,
  setCameraX,
  getCameraY,
  setCameraY,
  getCameraZ,
  setCameraZ,
  getCameraShake,
  setCameraShake,
  prepareFrame,
  endFrame,
} from './renderer';
import { showNotice, runOutro } from './terminal';

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
export function getCpusRebooted() {
  return cpusRebooted;
}
export function setCpusRebooted(rebooted) {
  cpusRebooted = rebooted;
}

export let currentLevel = 0;
export let currentPlayer;
export let entities: Entity[] = [];
export let entitiesToKill: Entity[] = [];

export type OnLoadImageCallback = (this: HTMLImageElement) => void;

export function loadImage(name, callback: OnLoadImageCallback) {
  tmp = new Image();
  tmp.src = 'm/' + name + '.png';
  tmp.onload = callback;
}

export function nextLevel(callback?: () => void) {
  if (currentLevel === 3) {
    entitiesToKill.push(currentPlayer);
    runOutro();
  } else {
    currentLevel++;
    loadLevel(currentLevel, callback);
  }
}

function loadLevel(id, callback?: () => void) {
  randomSeed(0xbadc0de1 + id);
  loadImage('l' + id, function() {
    entities = [];
    setNumVerts(0);
    setNumLights(0);

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
        // tslint:disable no-bitwise
        const colorKey =
          ((tmp[index * 4] >> 4) << 8) +
          ((tmp[index * 4 + 1] >> 4) << 4) +
          (tmp[index * 4 + 2] >> 4);
        // tslint:enable no-bitwise

        if (colorKey !== 0) {
          const tile = (levelData[index] =
            colorKey === 0x888 // wall
              ? randomInt(0, 5) < 4
                ? 8
                : randomInt(8, 17)
              : // prettier-ignore
                randomArray([
                  1, 1, 1, 1, 1, 3, 3, 2, 5, 5, 5, 5, 5, 5, 7, 7, 6
                ])); // floor

          if (tile > 7) {
            // walls
            pushBlock(x * 8, y * 8, 4, tile - 1);
          } else if (tile > 0) {
            // floor
            pushFloor(x * 8, y * 8, tile - 1);

            // enemies and items
            if (randomInt(0, 16 - id * 2) === 0) {
              // tslint:disable-next-line no-unused-expression
              new Spider(x * 8, 0, y * 8, 5, 27);
            } else if (randomInt(0, 100) === 0) {
              // tslint:disable-next-line no-unused-expression
              new Health(x * 8, 0, y * 8, 5, 31);
            }
          }

          // cpu
          if (colorKey === 0x00f) {
            levelData[index] = 8;
            // tslint:disable-next-line no-unused-expression
            new Cpu(x * 8, 0, y * 8, 0, 18);
            cpusTotal++;
          }

          // sentry
          if (colorKey === 0xf00) {
            // tslint:disable-next-line no-unused-expression
            new Sentry(x * 8, 0, y * 8, 5, 32);
          }

          // player start position (blue)
          if (colorKey === 0x0f0) {
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

    setCameraX(-currentPlayer.x);
    setCameraY(-300);
    setCameraZ(-currentPlayer.z - 100);

    setLevelNumVerts(getNumVerts());

    showNotice(
      'SCANNING FOR OFFLINE SYSTEMS...___' + cpusTotal + ' SYSTEMS FOUND',
    );
    // tslint:disable-next-line no-unused-expression
    callback && callback();
  });
}

export function reloadLevel() {
  loadLevel(currentLevel);
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

export function gameTick() {
  const timeNow = performance.now();
  timeElapsed = (timeNow - timeLast) / 1000;
  timeLast = timeNow;

  prepareFrame();

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
  setCameraX(getCameraX() * 0.92 - currentPlayer.x * 0.08);
  setCameraY(getCameraY() * 0.92 - currentPlayer.y * 0.08);
  setCameraZ(getCameraZ() * 0.92 - currentPlayer.z * 0.08);

  // add camera shake
  setCameraShake(getCameraShake() * 0.9);
  setCameraX(getCameraX() + getCameraShake() * (math.random() - 0.5));
  setCameraZ(getCameraZ() + getCameraShake() * (math.random() - 0.5));

  // health bar, render with plasma sprite
  for (let i = 0; i < currentPlayer.h; i++) {
    pushSprite(
      -getCameraX() - 50 + i * 4,
      29 - getCameraY(),
      -getCameraZ() - 30,
      26,
    );
  }

  endFrame();

  // remove dead entities
  entities = entities.filter(entity => !entitiesToKill.includes(entity));
  entitiesToKill = [];

  requestAnimationFrame(gameTick);
}
