import { udef } from './game';

import vertexShader from './s/vert.glsl';
import fragmentShader from './s/frag.glsl';

export const c = document.getElementById('c') as HTMLCanvasElement;
export const a = document.getElementById('a') as HTMLSpanElement;

const gl = c.getContext('webgl') as WebGLRenderingContext;
let vertexBuffer;
let shaderProgram;

const textureSize = 1024;
const tileSize = 16;
const tileFraction = tileSize / textureSize;
const pxNudge = 0.5 / textureSize;

const maxVerts = 1024 * 64;

let numVerts = 0;
export function getNumVerts() {
  return numVerts;
}
export function setNumVerts(verts) {
  numVerts = verts;
}

let levelNumVerts;
export function setLevelNumVerts(verts) {
  levelNumVerts = verts;
}

// allow 64k verts, 8 properties per vert
const bufferData = new Float32Array(maxVerts * 8);

let lightUniform;
const maxLights = 32;

let numLights = 0;
export function setNumLights(lights) {
  numLights = lights;
}

// 32 lights, 7 properties per light
const lightData = new Float32Array(maxLights * 7);

let cameraX = 0;
export function getCameraX() {
  return cameraX;
}
export function setCameraX(x) {
  cameraX = x;
}

let cameraY = 0;
export function getCameraY() {
  return cameraY;
}
export function setCameraY(y) {
  cameraY = y;
}

let cameraZ = 0;
export function getCameraZ() {
  return cameraZ;
}
export function setCameraZ(z) {
  cameraZ = z;
}

let cameraShake = 0;
export function getCameraShake() {
  return cameraShake;
}
export function setCameraShake(shake) {
  cameraShake = shake;
}

let cameraUniform;

export function initRenderer() {
  // Create shorthand WebGL function names
  // var webglShortFunctionNames = {};
  for (const name in gl) {
    if (gl[name].length !== udef) {
      const match = name.match(/(^..|[A-Z]|\d.|v$)/g);
      if (match !== null) {
        gl[match.join('')] = gl[name];
      }
      // webglShortFunctionNames[name] = 'gl.'+name.match(/(^..|[A-Z]|\d.|v$)/g).join('');
    }
  }
  // console.log(JSON.stringify(webglShortFunctionNames, null, '\t'));

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.DYNAMIC_DRAW);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, compileShader(gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(
    shaderProgram,
    compileShader(gl.FRAGMENT_SHADER, fragmentShader),
  );
  gl.linkProgram(shaderProgram);
  // console.log({ programInfoLog: gl.getProgramInfoLog(shaderProgram) });

  gl.useProgram(shaderProgram);

  cameraUniform = gl.getUniformLocation(shaderProgram, 'cam');
  lightUniform = gl.getUniformLocation(shaderProgram, 'l');

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.viewport(0, 0, c.width, c.height);

  enableVertexAttrib('p', 3, 8, 0);
  enableVertexAttrib('uv', 2, 8, 3);
  enableVertexAttrib('n', 3, 8, 5);
}

export function bindImage(image) {
  const texture2d = gl.TEXTURE_2D;

  gl.bindTexture(texture2d, gl.createTexture());
  gl.texImage2D(texture2d, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.texParameteri(texture2d, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(texture2d, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(texture2d, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(texture2d, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

export function prepareFrame() {
  numVerts = levelNumVerts;
  numLights = 0;

  // reset all lights
  lightData.fill(1);
}

export function endFrame() {
  gl.uniform3f(cameraUniform, cameraX, cameraY - 10, cameraZ - 30);
  gl.uniform1fv(lightUniform, lightData);

  gl.clearColor(0, 0, 0, 1);
  // tslint:disable-next-line no-bitwise
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, numVerts);
}

// prettier-ignore
function pushQuad(
  x1, y1, z1,
  x2, y2, z2,
  x3, y3, z3,
  x4, y4, z4,
  nx, ny, nz,
  tile,
) {
  const u = tile * tileFraction + pxNudge;
  bufferData.set(
    // prettier-ignore
    [
      x1, y1, z1, u, 0, nx, ny, nz,
      x2, y2, z2, u + tileFraction - pxNudge, 0, nx, ny, nz,
      x3, y3, z3, u, 1, nx, ny, nz,
      x2, y2, z2, u + tileFraction - pxNudge, 0, nx, ny, nz,
      x3, y3, z3, u, 1, nx, ny, nz,
      x4, y4, z4, u + tileFraction - pxNudge, 1, nx, ny, nz
    ],
    numVerts * 8,
  );
  numVerts += 6;
}

export function pushSprite(x, y, z, tile) {
  // tilt sprite when closer to camera
  const tilt = 3 + (cameraZ + z) / 12;

  // prettier-ignore
  pushQuad(
    x, y + 6, z,
    x + 6, y + 6, z,
    x, y, z + tilt,
    x + 6, y, z + tilt,
    0, 0, 1,
    tile,
  );
}

export function pushFloor(x, z, tile) {
  // prettier-ignore
  pushQuad(
    x, 0, z, x + 8,
    0, z, x, 0,
    z + 8, x + 8, 0,
    z + 8, 0, 1, 0,
    tile,
  );
}

export function pushBlock(x, z, tileTop, tileSites) {
  // tall blocks for certain tiles
  // tslint:disable-next-line no-bitwise
  const y = ~[8, 9, 17].indexOf(tileSites) ? 16 : 8;

  // prettier-ignore
  pushQuad(
    x, y, z,
    x + 8, y, z,
    x, y, z + 8,
    x + 8, y, z + 8,
    0, 1, 0,
    tileTop,
  ); // top

  // prettier-ignore
  pushQuad(
    x + 8, y, z,
    x + 8, y, z + 8,
    x + 8, 0, z,
    x + 8, 0, z + 8,
    1, 0, 0,
    tileSites,
  ); // right

  // prettier-ignore
  pushQuad(
    x, y, z + 8,
    x + 8, y, z + 8,
    x, 0, z + 8,
    x + 8, 0, z + 8,
    0, 0, 1,
    tileSites,
  ); // front

  // prettier-ignore
  pushQuad(
    x, y, z,
    x, y, z + 8,
    x, 0, z,
    x, 0, z + 8,
    -1, 0, 0,
    tileSites,
  ); // left
}

export function pushLight(x, y, z, r, g, b, falloff) {
  if (numLights < maxLights) {
    // prettier-ignore
    lightData.set([
      x, y, z,
      r, g, b,
      falloff,
    ], numLights * 7);

    numLights++;
  }
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  // console.log({ shaderInfoLog: gl.getShaderInfoLog(shader) });
  return shader;
}

function enableVertexAttrib(name, count, size, offset) {
  const location = gl.getAttribLocation(shaderProgram, name);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(
    location,
    count,
    gl.FLOAT,
    false,
    size * 4,
    offset * 4,
  );
}
