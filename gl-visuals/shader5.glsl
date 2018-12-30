
float _sin (float x) {
  return sin(x);
  //return x - pow(x,3.)/6. + pow(x,5.)/120.;
}

float ccc (float time, vec2 coord, float i) {

  float dx = sin(time+i+0.02)*20.;
  float dy = i*20.;

  vec2 center = vec2(1000., 1800.);
  center += vec2(dx, dy);

  dy = cos(time+i+0.02)*20.;

  float d = l1(coord, center);
  float phi = angle(coord, center);

  //float dr = tri(phi*(10.+i)+time*20.)*20.;
  //dr *= _sin(uTime*0.2);
  //d += dr;


  float r = (700. + i*700.) * (sin(time)*0.5+0.5);
  if (d>r && d<r*1.12)
    return 0.3;

  return 0.0;
}


void main(void) {

  //init();
  vec2 coord = vec2(1000.,1024.) - gl_FragCoord.xy;
  coord += vec2(0, 1024.*uJ);

  if (uTiles != 0.) {

  }
  vec3 col = vec3(0., 0., sin(uTime*4.));

  col += ccc(uTime, coord, 0.);
  col += ccc(uTime, coord, 0.4);
  col += ccc(uTime, coord, 0.8);
  col += ccc(uTime, coord, 1.2);
  col += ccc(uTime, coord, 1.6);


  gl_FragColor = vec4(col, 1.0);
}
