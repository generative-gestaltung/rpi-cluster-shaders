void main(void) {

  init();
  vec3 col = vec3(0);
  col.x *= sin(uTime*2.+coord.x*0.02);
  // col *= rand (floor(100.*coord*0.001+vec2(uTime*500.,uTime*200.)));
  vec2 center = vec2(400.+sin(uTime)*700., 200.+cos(uTime)*200.);
  center = vec2(1400.,1400.);
  float dist = distance(coord, center)*0.01;
  float phi = angle(center, coord);
  float len = sin(uTime*0.1)*20.;
  // let = 10.;

  if (abs(mod(dist*len, TWO_PI) - phi)<3. && abs(mod(dist*len, TWO_PI) - phi)>2.+sin(uTime*2.+coord.x*0.01)) {
    col = vec3(8.-mod(uTime*30., 10.));
  }

  for (float i=0.; i<10.; i++) {
    if (l1(phi+i*1.4, mod(uTime*(2.+i*0.0), TWO_PI))<0.004) {
      col = vec3(1.)-col;
    }
  }

  gl_FragColor = vec4(col, 1.0);
}
