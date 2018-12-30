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
