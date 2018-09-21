import { udef } from './game';

import vertex_shader from './s/vert.glsl';
import fragment_shader from './s/frag.glsl';

const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
let vertexBuffer;
let shaderProgram;

const textureSize = 1024;
const tileSize = 16;
const tileFraction = tileSize / textureSize;
const pxNudge = 0.5 / textureSize;

const maxVerts = 1024 * 64;

let numVerts = 0;
export function get_num_verts() {
  return numVerts;
}
export function set_num_verts(verts) {
  numVerts = verts;
}

let levelNumVerts;
export function get_level_num_verts() {
  return levelNumVerts;
}
export function set_level_num_verts(verts) {
  levelNumVerts = verts;
}

// allow 64k verts, 8 properties per vert
const bufferData = new Float32Array(maxVerts * 8);

let lightUniform;
const maxLights = 32;

let numLights = 0;
export function get_num_lights() {
  return numLights;
}
export function set_num_lights(lights) {
  numLights = lights;
}

// 32 lights, 7 properties per light
const lightData = new Float32Array(maxLights * 7);

let cameraX = 0;
export function get_camera_x() {
  return cameraX;
}
export function set_camera_x(x) {
  cameraX = x;
}

let cameraY = 0;
export function get_camera_y() {
  return cameraY;
}
export function set_camera_y(y) {
  cameraY = y;
}

let cameraZ = 0;
export function get_camera_z() {
  return cameraZ;
}
export function set_camera_z(z) {
  cameraZ = z;
}

let cameraShake = 0;
export function get_camera_shake() {
  return cameraShake;
}
export function set_camera_shake(shake) {
  cameraShake = shake;
}

let cameraUniform;

export function renderer_init() {
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
  gl.attachShader(
    shaderProgram,
    compile_shader(gl.VERTEX_SHADER, vertex_shader),
  );
  gl.attachShader(
    shaderProgram,
    compile_shader(gl.FRAGMENT_SHADER, fragment_shader),
  );
  gl.linkProgram(shaderProgram);
  // console.log({ programInfoLog: gl.getProgramInfoLog(shader_program) });

  gl.useProgram(shaderProgram);

  cameraUniform = gl.getUniformLocation(shaderProgram, 'cam');
  lightUniform = gl.getUniformLocation(shaderProgram, 'l');

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.viewport(0, 0, c.width, c.height);

  enable_vertex_attrib('p', 3, 8, 0);
  enable_vertex_attrib('uv', 2, 8, 3);
  enable_vertex_attrib('n', 3, 8, 5);
}

export function renderer_bind_image(image) {
  const texture2d = gl.TEXTURE_2D;

  gl.bindTexture(texture2d, gl.createTexture());
  gl.texImage2D(texture2d, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.texParameteri(texture2d, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(texture2d, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(texture2d, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(texture2d, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

export function renderer_prepare_frame() {
  numVerts = levelNumVerts;
  numLights = 0;

  // reset all lights
  lightData.fill(1);
}

export function renderer_end_frame() {
  gl.uniform3f(cameraUniform, cameraX, cameraY - 10, cameraZ - 30);
  gl.uniform1fv(lightUniform, lightData);

  gl.clearColor(0, 0, 0, 1);
  // tslint:disable-next-line no-bitwise
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.DYNAMIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, numVerts);
}

// prettier-ignore
function push_quad(
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

export function push_sprite(x, y, z, tile) {
  // tilt sprite when closer to camera
  const tilt = 3 + (cameraZ + z) / 12;

  // prettier-ignore
  push_quad(
    x, y + 6, z,
    x + 6, y + 6, z,
    x, y, z + tilt,
    x + 6, y, z + tilt,
    0, 0, 1,
    tile,
  );
}

export function push_floor(x, z, tile) {
  // prettier-ignore
  push_quad(
    x, 0, z, x + 8,
    0, z, x, 0,
    z + 8, x + 8, 0,
    z + 8, 0, 1, 0,
    tile,
  );
}

export function push_block(x, z, tileTop, tileSites) {
  // tall blocks for certain tiles
  // tslint:disable-next-line no-bitwise
  const y = ~[8, 9, 17].indexOf(tileSites) ? 16 : 8;

  // prettier-ignore
  push_quad(
    x, y, z,
    x + 8, y, z,
    x, y, z + 8,
    x + 8, y, z + 8,
    0, 1, 0,
    tileTop,
  ); // top

  // prettier-ignore
  push_quad(
    x + 8, y, z,
    x + 8, y, z + 8,
    x + 8, 0, z,
    x + 8, 0, z + 8,
    1, 0, 0,
    tileSites,
  ); // right

  // prettier-ignore
  push_quad(
    x, y, z + 8,
    x + 8, y, z + 8,
    x, 0, z + 8,
    x + 8, 0, z + 8,
    0, 0, 1,
    tileSites,
  ); // front

  // prettier-ignore
  push_quad(
    x, y, z,
    x, y, z + 8,
    x, 0, z,
    x, 0, z + 8,
    -1, 0, 0,
    tileSites,
  ); // left
}

export function push_light(x, y, z, r, g, b, falloff) {
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

function compile_shader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  // console.log({ shaderInfoLog: gl.getShaderInfoLog(shader) });
  return shader;
}

function enable_vertex_attrib(name, count, size, offset) {
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
