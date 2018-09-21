import { init } from './audio';
import {
  docu,
  OnLoadImageCallback,
  load_image,
  next_level,
  game_tick,
} from './game';
import {
  terminal_write_line,
  terminal_cancel,
  terminal_hide,
  terminal_run_intro,
} from './terminal';
import { renderer_init, renderer_bind_image } from './renderer';

terminal_write_line('INITIATING...');

const onLoadImage: OnLoadImageCallback = function() {
  terminal_hide();
  renderer_bind_image(this);
  next_level(game_tick);
};

init(() => {
  docu.onclick = () => {
    docu.onclick = null;
    terminal_cancel();
    terminal_write_line('INITIATING...', () => {
      renderer_init();

      load_image('q2', onLoadImage);
    });
  };

  terminal_run_intro();
});
