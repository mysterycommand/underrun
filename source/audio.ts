import {
  sonantxr_generate_song,
  sonantxr_generate_sound,
} from './sonantx-reduced';

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

var audio_ctx = new AudioContext();

export var shoot;
export var hit;
export var hurt;
export var beep;
export var pickup;
export var terminal;
export var explode;

export function audio_init(callback) {
  sonantxr_generate_song(audio_ctx, music_dark_meat_beat, function(buffer) {
    audio_play(buffer, true);
    callback();
  });

  sonantxr_generate_sound(audio_ctx, sound_shoot, 140, function(buffer) {
    shoot = buffer;
  });

  sonantxr_generate_sound(audio_ctx, sound_hit, 134, function(buffer) {
    hit = buffer;
  });

  sonantxr_generate_sound(audio_ctx, sound_beep, 173, function(buffer) {
    beep = buffer;
  });

  sonantxr_generate_sound(audio_ctx, sound_hurt, 144, function(buffer) {
    hurt = buffer;
  });

  sonantxr_generate_sound(audio_ctx, sound_pickup, 156, function(buffer) {
    pickup = buffer;
  });

  sonantxr_generate_sound(audio_ctx, sound_terminal, 156, function(buffer) {
    terminal = buffer;
  });

  sonantxr_generate_sound(audio_ctx, sound_explode, 114, function(buffer) {
    explode = buffer;
  });
}

export function audio_play(buffer, loop) {
  var source = audio_ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  source.connect(audio_ctx.destination);
  source.start();
}
