import { initAudio } from './audio';
import {
  docu,
  OnLoadImageCallback,
  loadImage,
  nextLevel,
  gameTick,
} from './game';
import { writeLine, cancel, hide, runIntro } from './terminal';
import { initRenderer, bindImage } from './renderer';

writeLine('INITIATING...');

const onLoadImage: OnLoadImageCallback = function() {
  hide();
  bindImage(this);
  nextLevel(gameTick);
};

initAudio(() => {
  docu.onclick = () => {
    docu.onclick = null;
    cancel();

    writeLine('INITIATING...', () => {
      initRenderer();
      loadImage('q2', onLoadImage);
    });
  };

  runIntro();
});
