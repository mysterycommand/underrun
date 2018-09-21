let randHigh;
let randLow;

export function random_int(min, max) {
  // tslint:disable no-bitwise
  randHigh = ((randHigh << 16) + (randHigh >> 16) + randLow) & 0xffffffff;
  randLow = (randLow + randHigh) & 0xffffffff;
  const n = (randHigh >>> 0) / 0xffffffff;
  return (min + n * (max - min + 1)) | 0;
  // tslint:enable no-bitwise
}

export function random_seed(seed) {
  randHigh = seed || 0xbadc0ffe;
  // tslint:disable-next-line no-bitwise
  randLow = seed ^ 0x49616e42;
}

export function array_rand(array) {
  return array[random_int(0, array.length - 1)];
}
