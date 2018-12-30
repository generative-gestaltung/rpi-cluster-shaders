precision mediump float;
uniform float uTime;
uniform float uI;
uniform float uJ;
uniform float uW;
uniform float uH;
uniform float uX0;
uniform float uY0;
uniform float uTiles;

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
  coord = vec2(gl_FragCoord.x + uX0, uH-gl_FragCoord.y + uY0);
  coord = mix(coord, gl_FragCoord.xy*4., uTiles);
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

void main(void) {

  init();
  vec3 col = vec3(rand(coord*mod(uTime,50.)*(1.+uJ)));

  vec2 center = vec2(660., 480.);

  float phi = atan(coord.y - center.y, coord.x - center.x);


  for (int i=0; i<1; i++) {


    float t = 1.0;//sin(uTime*0.1+float(i)*0.02)*1.2+0.2;
    if (t>1.0) t = 1.0;

    float dX = mix (
      l0(coord.xy, center),
      l1(coord.xy, center),
      t
    );

    float f = 100.;//sin(uTime*0.2+coord.y*0.1)*20.;
    float A = sin(phi - uTime)*20.;
    dX += A*sin(phi*f+uTime*4.0+float(i))*3.;

    float rMax = t*560.;

    if (dX>(rMax-2.0) && dX<(rMax+20.0)) {
      col = vec3(sin(uTime*25.*sin(uTime*0.2))*2.5-1.);
    }
  }

  gl_FragColor = vec4(col, 1.0);
}
