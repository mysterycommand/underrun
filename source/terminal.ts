import { play, terminal } from './audio';
import { math } from './game';
import { c, a } from './renderer';

const textIndent = '&gt; ';
const textTitle =
  '' +
  'UNDERRUN\n' +
  '__ \n' +
  'CONCEPT, GRAPHICS &AMP; PROGRAMMING:\n' +
  'DOMINIC SZABLEWSKI // PHOBOSLAB.ORG\n' +
  '__ \n' +
  'MUSIC:\n' +
  'ANDREAS LÖSCH // NO-FATE.NET\n' +
  '___ \n' +
  'SYSTEM VERSION: 13.20.18\n' +
  'CPU: PL(R) Q-COATL 7240 @ 12.6 THZ\n' +
  'MEMORY: 108086391056891900 BYTES\n' +
  ' \n' +
  'CONNECTING...';

let textGarbage =
  '´A1e{∏éI9·NQ≥ÀΩ¸94CîyîR›kÈ¡˙ßT-;ûÅf^˛,¬›A∫Sã€«ÕÕ' +
  '1f@çX8ÎRjßf•ò√ã0êÃcÄ]Î≤moDÇ’ñ‰\\ˇ≠n=(s7É;';

const textStory =
  'DATE: SEP. 13, 2718 - 13:32\n' +
  'CRITICAL SOFTWARE FAILURE DETECTED\n' +
  'ANALYZING...\n' +
  '____\n \n' +
  'ERROR CODE: JS13K2018\n' +
  'STATUS: SYSTEMS OFFLINE\n' +
  'DESCRIPTION: BUFFER UNDERRUN DUE TO SATCOM R.U.D.\n' +
  'AFFECTED SYSTEM: FACILITY AUTOMATION\n' +
  'AFFECTED SUBSYSTEMS: AI, RADIATION SHIELDS, POWER MANAGEMENT\n' +
  ' \n' +
  'INITIATING RESCUE SYSTEM...\n' +
  '___' +
  'FAILED\n \n' +
  'ATEMPTING AUTOMATED REBOOT...\n' +
  '___' +
  'FAILED\n' +
  '_ \n \n' +
  'MANUAL REBOOT OF ALL SYSTEMS REQUIRED\n' +
  '_ \n' +
  'USE WASD OR CURSOR KEYS TO MOVE, MOUSE TO SHOOT\n' +
  'CLICK TO INITIATE YOUR DEPLOYMENT\n ';

const textOutro =
  'ALL SATELLITE LINKS ONLINE\n' +
  'CONNECTING...___' +
  'CONNECTION ESTABLISHED\n' +
  'RECEIVING TRANSMISSION...___ \n' +
  'SENT: SEP. 13, 2018\n' +
  'RCVD: SEP. 13, 2718\n \n' +
  'THANKS FOR PLAYING ❤_ \n' +
  'I HAVE PREVIOUSLY BEEN A PROUD SPONSOR OF THE JS13K\n' +
  'COMPETITION SINCE THE VERY FIRST ONE BACK IN 2012.\n' +
  "HOWEVER, THIS YEAR'S COMPETITION WAS MY FIRST ONE\n" +
  'AS A PARTICIPANT AND IT HAS BEEN TREMENDOUS FUN!\n \n' +
  'I WANT TO THANK MY DEAR FRIEND ANDREAS LÖSCH OF\n' +
  'NO-FATE.NET FOR COMPOSING SOME AWESOME MUSIC ON\n' +
  'SUCH SHORT NOTICE.\n \n' +
  'FURTHER THANKS GO OUT TO THE JS13K STAFF, THE\n' +
  'SONANT-X DEVELOPERS AND ALL OTHER PARTICIPANTS\n' +
  "IN THIS YEAR'S JS13K. SEE YOU NEXT YEAR!\n \n" +
  'DOMINIC__' +
  'END OF TRANSMISSION';

let textBuffer: string[] = [];
let lineWait = 100;
let printIndent = true;
let timeoutId = 0;
let hideTimeout = 0;

textGarbage += textGarbage + textGarbage;

function show() {
  clearTimeout(hideTimeout);
  a.style.opacity = '1';
  a.style.display = 'block';
}

export function hide() {
  a.style.opacity = '0';
  hideTimeout = setTimeout(() => {
    a.style.display = 'none';
  }, 1000);
}

export function cancel() {
  clearTimeout(timeoutId);
}

function prepareText(text) {
  return text.replace(/_/g, '\n'.repeat(10)).split('\n');
}

function writeText(lines, callback?: () => void) {
  if (lines.length) {
    writeLine(lines.shift(), () => writeText(lines, callback));
  } else {
    // tslint:disable-next-line no-unused-expression
    callback && callback();
  }
}

export function writeLine(line, callback?: () => void) {
  if (textBuffer.length > 20) {
    textBuffer.shift();
  }
  if (line) {
    play(terminal);
    textBuffer.push((printIndent ? textIndent : '') + line);
    a.innerHTML =
      '<div>' + textBuffer.join('&nbsp;</div><div>') + '<b>█</b></div>';
  }
  timeoutId = setTimeout(callback, lineWait);
}

export function showNotice(notice, callback?: () => void) {
  a.innerHTML = '';
  textBuffer = [];

  cancel();
  show();
  writeText(prepareText(notice), () => {
    timeoutId = setTimeout(() => {
      hide();
      // tslint:disable-next-line no-unused-expression
      callback && callback();
    }, 2000);
  });
}

export function runIntro(callback?: () => void) {
  textBuffer = [];
  writeText(prepareText(textTitle), () => {
    timeoutId = setTimeout(() => {
      runGarbage(callback);
    }, 4000);
  });
}

function runGarbage(callback) {
  printIndent = false;
  lineWait = 16;

  let t = textGarbage;
  const length = textGarbage.length;

  for (let i = 0; i < 64; i++) {
    // tslint:disable no-bitwise
    const s = (math.random() * length) | 0;
    const e = (math.random() * (length - s)) | 0;
    // tslint:enable no-bitwise
    t += textGarbage.substr(s, e) + '\n';
  }

  t += ' \n \n';
  writeText(prepareText(t), () => {
    timeoutId = setTimeout(() => {
      runStory(callback);
    }, 1500);
  });
}

function runStory(callback) {
  printIndent = true;
  lineWait = 100;
  writeText(prepareText(textStory), callback);
}

export function runOutro() {
  c.style.opacity = '0.3';
  a.innerHTML = '';
  textBuffer = [];

  cancel();
  show();
  writeText(prepareText(textOutro));
}
