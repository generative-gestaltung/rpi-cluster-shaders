precision mediump float;
uniform float uTime;
uniform float uI;
uniform float uJ;
uniform float uW;
uniform float uH;
uniform float uX0;
uniform float uY0;
uniform float uTiles;
uniform float uHide;

float l1(float x0, float x1) {
  return abs(x0-x1);
}

float l0 (vec2 p0, vec2 p1) {
  return max(abs(p0.x-p1.x), abs(p0.y-p1.y)*uW/uH*2.0);
}

float l1 (vec2 p0, vec2 p1) {
  return distance(p0,p1);
}

float rand (vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233)))*43758.5453);
}

vec2 coord;
#define TWO_PI 6.283185


void init() {
  coord = vec2(gl_FragCoord.x + uI*1280., uH-gl_FragCoord.y + uJ*1024.);
  //coord = mix(coord, gl_FragCoord.xy*4., uTiles);
}

float pulse (float ph, float n) {
  float env = sin(ph);
  env = clamp(env*5., 0., 1.0);
  return sin(ph*n)*env;
}

float angle (vec2 v0, vec2 v1) {
  float ret = atan(v0.y - v1.y, v0.x - v1.x);
  if (ret < 0.) {
    ret += TWO_PI;
  }
  return ret;
}

float ramp(float phi) {
  return mod(phi, TWO_PI)/TWO_PI;
}

float tri(float phi) {
  float ret = ramp(phi)*2.;
  if (ret > 1.) ret = 2.-ret;
  return ret;
}

float circ (float phi) {

  phi = mod(phi, 2.);
  float ret = cos(asin(phi));
  if (phi>1.) ret = 1.;
  return ret;
}
