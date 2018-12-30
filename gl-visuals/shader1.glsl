void main(void) {
  init();
  float b = clamp(sin(uTime*4.+uI)*10.-8.5, 0., 2.0);

  vec3 col = vec3(rand(floor(coord*0.04+vec2(uTime*2.*(uJ+4.),0.))*10.))*b;

  if (mod(coord.x, 13.0)<2.) {
    col = vec3(rand(floor(coord*0.04+vec2(uTime*2.*(uJ+4.), sin(uTime+coord.x*0.001)))*10.));
  }

  gl_FragColor = vec4(col, 1.0);
}
