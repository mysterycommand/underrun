import { generateSong, generateSound } from './sonantx-reduced';

import { music_dark_meat_beat } from './music-dark-meat-beat';
import {
  terminalSound,
  shootSound,
  hitSound,
  beepSound,
  hurtSound,
  pickupSound,
  explodeSound,
} from './sound-effects';

const audioContext = new AudioContext();

export let shoot;
export let hit;
export let hurt;
export let beep;
export let pickup;
export let terminal;
export let explode;

export function init(callback) {
  generateSong(audioContext, music_dark_meat_beat, buffer => {
    play(buffer, true);
    callback();
  });

  generateSound(audioContext, shootSound, 140, buffer => {
    shoot = buffer;
  });

  generateSound(audioContext, hitSound, 134, buffer => {
    hit = buffer;
  });

  generateSound(audioContext, beepSound, 173, buffer => {
    beep = buffer;
  });

  generateSound(audioContext, hurtSound, 144, buffer => {
    hurt = buffer;
  });

  generateSound(audioContext, pickupSound, 156, buffer => {
    pickup = buffer;
  });

  generateSound(audioContext, terminalSound, 156, buffer => {
    terminal = buffer;
  });

  generateSound(audioContext, explodeSound, 114, buffer => {
    explode = buffer;
  });
}

export function play(buffer, loop = false) {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  source.connect(audioContext.destination);
  source.start();
}
