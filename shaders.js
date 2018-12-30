var PREFIX = `
precision mediump float;
uniform float uTime;
uniform float uI;
uniform float uJ;
uniform float uW;
uniform float uH;
uniform float uX0;
uniform float uY0;
uniform float uTiles;
uniform int uSelect;

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

`;


var SHADERS = {

  FRAG_00 : `
  void main(void) {
    init();
    float b = clamp(sin(uTime*4.+uI)*10.-8.5, 0., 2.0);

    vec3 col = vec3(rand(floor(coord*0.04+vec2(uTime*2.*(uJ+4.),0.))*10.))*b;

    if (mod(coord.x, 13.0)<2.) {
      col = vec3(rand(floor(coord*0.04+vec2(uTime*2.*(uJ+4.), sin(uTime+coord.x*0.001)))*10.));
    }

    gl_FragColor = vec4(col, 1.0);
  }`,


  FRAG_01 : `
  void main(void) {

      init();
      float f = 10.;
      vec3 col = vec3(0.);//cos(uTime*f+3.1)*0.5+0.5);


      float t = 1.;//sin(uTime*0.1)*0.5+0.5;

      vec2 center = vec2(680.,450.);

      for (int i=0; i<20; i++) {

        float dX = mix (
          l0(coord.xy, center),
          l1(coord.xy, center),
          t
        );
        float phi = atan(coord.y - center.y, coord.x - center.x);


        float xx = sin(uTime*.9+0.6+float(i)*0.06)*300.+600.0;
        xx = clamp(xx, 650., 300.);

        float A = clamp(sin(uTime), 0., 1.)*10.;
        // A = 0.;
        xx *= (1.+A*sin(coord.x*0.014*(phi+4.9)+uTime)*0.01);


        A = pulse(uTime*3., 2.);
        // A = 0.;
        xx += ((sin(phi*13.4+uTime*4.*float(i))*14.)*sin(phi*42.-uTime*12.+coord.x*0.2)*2.)*A;
        // xx += pulse(phi*4.*sin(uTime)+uTime, 5.)*20.;

        if (dX>(xx-2.0) && dX<(xx+1.0)) {
          col = vec3(sin(uTime*f+1.7+float(i)*0.3)*0.5+0.5);
        }
      }

      gl_FragColor = vec4(col, 1.0);
  }`,


  FRAG_02 : `

  void main(void) {

      init();

      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = gl_FragCoord.xy / vec2(uW, uH);

      // Time varying pixel color
      vec3 col = vec3(0); //0.5 + 0.5*cos(uTime*10.0+uv.x));

      for (int i=0; i<10; i++) {
        float c = sin(-uTime*10.+coord.y*0.01)*0.5+0.7;

        float m = 4.+sin(uTime*0.5+floor(coord.x*0.01+mod(uTime*4.*coord.y*0.02, 1.))*10.)*3.;
        if (mod(coord.y,m)<1.)
          col = vec3(c, 0.0, 0.4*c);

        m = 4.+sin(uTime*0.5+floor(coord.x*(0.010+sin(uTime*0.4+0.4)*0.1)+mod(uTime*4.*coord.y*0.02, 1.))*10.)*3.;
        if (mod(coord.y,m)<0.4)
          col += vec3(0, 0, c*0.3);
      }



      gl_FragColor = vec4(col, 1.0);
  }`,

  FRAG_03 : `

  void main(void) {

      init();
      vec3 col = vec3(0);
      float dphi = ramp(uTime*0.3)*100.;
      for (int i=0; i<40; i++) {
        float dist = abs(coord.x-mod(uTime+dphi-float(i),9.)*coord.y);
        if (dist<13.0)
          col = vec3(1., cos(dist*0.1+uTime*4.+float(i)), cos(dist*0.1+uTime*4.+float(i)));
      }
      gl_FragColor = vec4(col, 1.0);
  }`,

  FRAG_04 : `

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
  }`,

  FRAG_05 : `


  void main(void) {


    vec2 arr[24];
    vec2 arr2[24];

    init();

    for (int i=0; i<24; i++) {
      float row = 0.;
      if (rand(vec2(float(i), 40.))<0.5)
        row = 3.;
      arr[i]  = vec2(sin(uTime+float(i)*0.3)*400.+rand(vec2(float(i), 4.0))*uW+row*uW, rand(vec2(float(i), 10.))*uH*4.);
      arr2[i] = vec2(sin(uTime*0.4+float(i)*0.3-0.1)*400.+rand(vec2(float(i), 4.0))*uW+row*uW, rand(vec2(float(i), 10.))*uH*4.);
    }

    float dMin0 = 999999.9;
    float dMin1 = 999999.9;

    for (int i=0; i<24; i++) {
      float d = distance(coord, arr[i]);

      if (d<dMin0) {
        dMin1 = dMin0;
        dMin0 = d;
      }
    }

    float b = 1.-(dMin1-dMin0)*0.1;


    for (int i=0; i<24; i++) {
      float d = distance(coord, arr2[i]);

      if (d<dMin0) {
        dMin1 = dMin0;
        dMin0 = d;
      }
    }

    float t = sin(uTime*4.-coord.y*.9);
    float t2 = clamp(sin(uTime)*2., 0., 1.);
    float t3 = clamp(sin(uTime*0.1)*2., 0., 1.);
    t = mix(t, t2, t3);

    b = mix(b, (dMin1-dMin0)*0.003, t);

    vec3 col = vec3(b);


    gl_FragColor = vec4(col, 1.0);
  }`,

  FRAG_06 : `

  void main(void) {

    init();
    vec3 col = vec3(2.-mod(coord.y+uTime*30., 10.));

    vec2 center = vec2(400., 400.);

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
  }`,

  FRAG_07 : `

  const float worldSize = 150.0;
  const float pi = 3.1415926536;
  const vec3 skyColor = vec3(0.1, 86.0/255.0, 129.0/255.0);
  const vec3 skyColor2 = vec3(1.);

  vec3 cam;
  vec3 camRot;
  float tick = 0.0;

  // One of my favorite utilities :)
  float mod2(float a, float b) {
  	float c = mod(a, b);
  	return (c < 0.0) ? c + b : c;
  }


  // For coloring blocks, but current not used
  float rand2(vec2 co){
    return fract(sin(dot(co.xy*.01, vec2(25.5254, -15.5254))) * 52352.323);
  }


  // For block heights
  float _rand(vec2 co){
  	return min(rand2(co)+sin(co.x*.1-co.y*.5+tick*.2)*.1+cos(co.y*.3+co.x*.5+tick*.4)*.1,
                 .87+length(vec2(mod2(co.x-cam.x+worldSize*.5, worldSize)-worldSize*.5, mod2(co.y-cam.z+worldSize*.5, worldSize)-worldSize*.5))*.1);
  }

  vec3 getFG(vec3 co) {

    if(co.y/worldSize*2.5 < 0.8+sin(co.x+uTime)*0.01) { //_rand(vec2(co.x, co.z))) {
      //Uncomment below for randomly colored blocks
      return vec3(_rand(vec2(co.x+co.y+1., co.z+2.)), _rand(vec2(co.x+3., co.z+co.y+4.)), _rand(vec2(co.x+co.y+5., co.z+co.y+6.)));
      return vec3(1.0, 1.0, 1.0);
    }
    return vec3(-1, 0, 0);
  }

  vec4 raycast(vec3 start, vec3 castSpeedStart) {

  	vec3 castSpeed = vec3(castSpeedStart.xyz);
    float skyAmount = castSpeed.y*.4;

  	vec4 returnValue = vec4(skyColor*skyAmount, 0.0);
  	vec3 ray = vec3(start.xyz);

    float shadowing = 1.0;
    vec3 currentCast = vec3(floor(ray));

    int collideWith = 0;

    bool skipLoop = false;
    for(float its=0.0; its<200.0; its++) {
      if(skipLoop) {
        skipLoop = false;
        continue;
      }

      // sky
  		if(currentCast.y<0.0 || currentCast.y>=worldSize*.4) {
  			returnValue = vec4(skyColor2*0., 0);
  			break;
  		}

  		vec3 inBlock = getFG (vec3(mod(currentCast.x, worldSize), mod(currentCast.y, worldSize), mod(currentCast.z, worldSize)));

      if(inBlock.x != -1.0) {
        float finalShadowing = clamp(shadowing-length(ray-start)/60.0, 0.0, 1.0);
        finalShadowing *= mod(.7*(float(collideWith)+5.0), 1.0)*.8+.2;
        finalShadowing = 1.;
        returnValue = vec4(inBlock*finalShadowing+(1.0-finalShadowing)*skyColor*skyAmount, 0.0 );
        break;
  		} // Here is also where I used to do reflections and fun stuff... recursively though

      // These last three IFs are checking if the ray passes the next voxel plane
  		if(castSpeed.x != 0.0) {
  			float t = ( floor(currentCast.x+clamp(sign(castSpeed.x), 0.0, 1.0)) -ray.x)/castSpeed.x;
  			vec3 cast1Tmp = ray+castSpeed*t;

  			if(cast1Tmp.y>=currentCast.y && cast1Tmp.y<=currentCast.y+1.0 && cast1Tmp.z>=currentCast.z && cast1Tmp.z<=currentCast.z+1.0) {
  				ray = cast1Tmp;
  				currentCast.x += sign(castSpeed.x);
  				collideWith = (castSpeed.x>0.0?0:1);
          skipLoop = true;
  				continue;
  			}
  		}

  		if(castSpeed.y != 0.0) {
  			float t = ( floor(currentCast.y+clamp(sign(castSpeed.y), 0.0, 1.0)) -ray.y)/castSpeed.y;
  			vec3 cast1Tmp = ray+castSpeed*t;
  			if(cast1Tmp.x>=currentCast.x && cast1Tmp.x<=currentCast.x+1.0 && cast1Tmp.z>=currentCast.z && cast1Tmp.z<=currentCast.z+1.0) {
  				ray = cast1Tmp;
  				currentCast.y += sign(castSpeed.y);
  				collideWith = (castSpeed.y>0.0?2:3);
          skipLoop = true;
  				continue;
  			}
  		}

  		if(castSpeed.z != 0.0) {
  			float t = ( floor(currentCast.z+clamp(sign(castSpeed.z), 0.0, 1.0)) -ray.z)/castSpeed.z;
  			vec3 cast1Tmp = ray+castSpeed*t;
  			if(cast1Tmp.y>=currentCast.y && cast1Tmp.y<=currentCast.y+1.0 && cast1Tmp.x>=currentCast.x && cast1Tmp.x<=currentCast.x+1.0) {
  				ray = cast1Tmp;
  				currentCast.z += sign(castSpeed.z);
  				collideWith = (castSpeed.z>0.0?4:5);
          skipLoop = true;
  				continue;
  			}
  		}
  	}

  	returnValue.w = length(ray-start);
    float val = 1.0-returnValue.w/70.0;

    return vec4(returnValue.xyz*val, 1.0);
  }


  void main (void) {

    init();

    vec2 iResolution = vec2(uW*2., 4.*uH);
    vec2 f2 = vec2 (coord.x, coord.y);
    tick = uTime;

    cam.x = worldSize/2.0; // +sin(tick/worldSize*14.0*pi)*0.0;
    cam.y = worldSize-96.0;
    cam.z = worldSize/2.0; // +tick*8.0;

    cam = floor(cam);

    // camRot = vec3(cos(uTime),sin(uTime),0.);//sin(tick/worldSize*22.0*pi)*.5+.5, 0.0, sin(tick/worldSize*14.0*pi)*.5);
    camRot = vec3(0., ramp(uTime)*TWO_PI*0., 0.);

    vec3 castDir = vec3(0, 0, 0);
    vec3 cast1 = vec3(cam+.1);
    vec3 cast2 = vec3(0, 0, 0);

    // Getting raycast speed based on the pixel in the frustrum
    castDir.x = f2.x/iResolution.y*5.0-(iResolution.x-iResolution.y)/2.0/iResolution.y*5.0-.5*5.0;
    castDir.y = (.5-f2.y/iResolution.y)*5.0;
    castDir.z = 3.;

    // Rotating camera in 3D
    cast2.x = castDir.x*(cos(camRot.y)*cos(camRot.z))+castDir.y*(cos(camRot.z)*sin(camRot.x)*sin(camRot.y)-cos(camRot.x)*sin(camRot.z))+castDir.z*(cos(camRot.x)*cos(camRot.z)*sin(camRot.y)+sin(camRot.x)*sin(camRot.z));
    cast2.y = castDir.x*(cos(camRot.y)*sin(camRot.z))+castDir.y*(cos(camRot.x)*cos(camRot.z)+sin(camRot.x)*sin(camRot.y)*sin(camRot.z))-castDir.z*(cos(camRot.z)*sin(camRot.x)-cos(camRot.x)*sin(camRot.y)*sin(camRot.z));
    cast2.z = -castDir.x*(sin(camRot.y))+castDir.y*(cos(camRot.y)*sin(camRot.x))+castDir.z*(cos(camRot.x)*cos(camRot.y));

    vec3 castResult = raycast(cast1, cast2).xyz;
    gl_FragColor = vec4(clamp(castResult, 0.0, 1.0), 1.0);
  }
  `,

  FRAG_08 : `

  void main(void) {

    init();
    coord = gl_FragCoord.xy;

    vec3 col = vec3(0.);

    for (int i=0; i<10; i++) {

      float dx = sin(uTime+float(i)+0.02)*20.;
      float dy = float(i)*20.;
      dy = cos(uTime+float(i)+0.02)*20.;
      vec2 center = vec2(200.+dx, 200.+dy);
      float d = (l1(coord, center));
      float phi = angle(coord, center);

      float dr = sin(phi*(10.+float(i))+uTime*20.)*20.;
      dr *= sin(uTime*0.2);
      d += dr;

      // d += (sin(uTime)*0.5+0.5)*rand(coord)*300.;

      float r = (50.+float(i)*20.) *sin(uTime)+60.;
      if (d>r && d<r*1.02)
        col += vec3(0.4);
    }
    gl_FragColor = vec4(col, 1.0);
  }`,

  FRAG_09 :
`
void main(void) {

  init();
  vec3 col = vec3(sin(uTime*14.)*0.5+0.5); //2.-mod(coord.y+uTime*30., 10.));
  col *= rand (floor(100.*coord*0.001+vec2(uTime*500.,uTime*200.)));
  vec2 center = vec2(400., 400.);

  float dist = distance(coord, center)*0.01;
  float phi = angle(center, coord);
  float len = sin(uTime*0.1)*20.;
  // let = 10.;

  if (abs(mod(dist*len, TWO_PI) - phi)<3. && abs(mod(dist*len, TWO_PI) - phi)>2.+sin(uTime*2.+coord.x*0.01)) {
    //col = vec3(8.-mod(coord.y-uTime*30., 10.));
  }

  for (float i=0.; i<15.; i++) {
    if (l1(phi+i*0.4, mod(uTime*(2.+i*0.0), TWO_PI))<0.04) {
      col = vec3(1.)-col;
    }
  }

  gl_FragColor = vec4(col, 1.0);
}
  `,

  FRAG_10 :
`
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
  `,


    FRAG_11 : `

  void main(void) {

 init();
    vec3 col = vec3(0.005);

    vec2 center = vec2(160., 280.);

    float phi = atan(coord.y - center.y, coord.x - center.x);


    for (int i=0; i<2; i++) {


      float t = 1.0+float(i);
      if (t>100.0) t = 1.0;
	  center = vec2(100.+t*20., 480.+t*24.);

      float dX = mix (
        l0(coord.xy, center),
        l1(coord.xy, center),
        t
      );
	  


      float f = 100.;//sin(uTime*0.)*20.;
      float A = sin(phi - uTime)*30.;
      dX += t*2.-A;
	  float rMax = t*10.*A;




      if (dX>(rMax-5.0) && dX<(rMax+20.0)) {
        col = vec3(0.5);
      }

  if (dX>(rMax-60.0-A*5.) && dX<(rMax-20.0-A)){
         col = vec3(0.07);

  
  }

    }


    gl_FragColor = vec4(col,0.8);
  }`  ,  
  
  FRAG_12 : `

  void main(void) {

   init();

      // Normalized pixel coordinates (from 0 to 1)
	 vec2 center = vec2(400., 400.);

      // Time varying pixel color
      vec3 col = vec3(0); //0.5 + 0.5*cos(uTime*10.0+uv.x));

      for (int i=0; i<10; i++) {

        float c = sin(-uTime*10.+coord.y*0.013)*0.10;

        float m =0.23+0.051;
		col = vec3(c*c*1.5,-c+m-0.65, 1.55*c+m*0.5);

				
		col = vec3(c*c*1.5,-c+m-0.65, 1.55*c+m*0.5);
		coord.y = coord.y-coord.x;
	    coord.x = (coord.x*0.944-coord.y*c*1.2+0.8); 
		
		



         
      }


    
  

    gl_FragColor = vec4(col,0.8);
  }`,
  
    FRAG_13 : `

  void main(void) {

 init();
    vec3 col = vec3(0.005);

    vec2 center = vec2(160., 280.);

    float phi = atan(coord.y - center.y, coord.x - center.x);


    for (int i=1; i<5; i++) {


      float t = 1.0+float(i)*3.;
      if (t>100.0) t = 1.0;
	  center = vec2(100.+t*60., 480.-t*24.);

      float dX = mix (
        l0(coord.xy, center),
        l1(coord.xy, center),
        t
      );
	  


     
      float A = sin(phi - uTime*1.)*10.;
	  float B =abs(A)* cos(phi+uTime*12.+phi/10.)*10.;
      dX += t*B;
	  float rMax = t*3.*pow(A,0.5);


      if (dX>(rMax-4.*A) && dX<(rMax+20.0+B)) {
        col = vec3(0.1);
      }

		 if (dX>(rMax-60.0-A) && dX<(rMax-10.0)){
         col = vec3(0.07, 0.02, 0.4);

  }

    }


    gl_FragColor = vec4(col,0.8);
  }` ,
  
      FRAG_14 : `

  void main(void) {

 init();
	vec3 col = vec3(0.03);

    vec2 center = vec2(110., 280.);

    float phi = atan(coord.y - center.y, coord.x - center.x);

	float t =1.;
    for (int i=1; i<5; i++) {


      float t = 1.0+float(i)*2.;
      if (t>100.0) t = 1.0;
	  center = vec2(100.+t*2., 480.-t*6.);

      float dX = mix (
        l0(coord.xy, center),
        l1(coord.xy, center),
        t
      );
	  


     
      float A = sin(phi - uTime*0.43)*10.;
	  float B =abs(A)* cos(phi+uTime*2.+phi/10.)*10.;
      dX += t*B;
	  float rMax = t*3.*A;




      if (dX>(rMax-4.*A) && dX<(rMax+20.0+A)) {
        col = vec3(0.1);

      }

	  if (dX>(rMax-60.0-B) && dX<(rMax-10.0)){
         col = vec3(0.07, 0.02, 0.04);

  }

    }


    gl_FragColor = vec4(col,0.8);
  }`  




};

var SHADER_LIST = [];
for (var i=0; i<Object.keys(SHADERS).length; i++) {
  var key = Object.keys(SHADERS)[i];
  SHADERS[key] = PREFIX + SHADERS[key];
  SHADER_LIST[i] = SHADERS[key];
}
