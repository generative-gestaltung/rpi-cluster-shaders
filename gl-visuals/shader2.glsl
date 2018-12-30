void main(void) {

  init();
  vec3 col = vec3(2.-mod(coord.y+uTime*30., 10.));

  vec2 center = vec2(400., 1200.);

  float dist = distance(coord, center)*0.01;
  float phi = angle(center, coord);
  float len = sin(uTime*0.1)*20.;
  // let = 10.;

  if (abs(mod(dist*len, TWO_PI) - phi)<3. && abs(mod(dist*len, TWO_PI) - phi)>2.+sin(uTime*2.+coord.x*0.01)) {
    col = vec3(8.-mod(coord.y-uTime*30., 10.));
  }

  for (float i=0.; i<15.; i++) {
    if (l1(phi+i*0.4, mod(uTime*(1.+i*0.0), TWO_PI))<0.1) {
      col = vec3(1.)-col;
    }
  }

  gl_FragColor = vec4(col, 1.0);
}
