import { generateSong, generateSound } from './sonantx-reduced';

import { music_dark_meat_beat } from './music-dark-meat-beat';
import {
  sound_terminal,
  sound_shoot,
  sound_hit,
  sound_beep,
  sound_hurt,
  sound_pickup,
  sound_explode,
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

  generateSound(audioContext, sound_shoot, 140, buffer => {
    shoot = buffer;
  });

  generateSound(audioContext, sound_hit, 134, buffer => {
    hit = buffer;
  });

  generateSound(audioContext, sound_beep, 173, buffer => {
    beep = buffer;
  });

  generateSound(audioContext, sound_hurt, 144, buffer => {
    hurt = buffer;
  });

  generateSound(audioContext, sound_pickup, 156, buffer => {
    pickup = buffer;
  });

  generateSound(audioContext, sound_terminal, 156, buffer => {
    terminal = buffer;
  });

  generateSound(audioContext, sound_explode, 114, buffer => {
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
