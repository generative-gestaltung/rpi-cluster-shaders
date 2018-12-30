#include <stdio.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <assert.h>
#include <unistd.h>
#include <stdlib.h>
#include "config.h"
#include "bcm_host.h"
#include "GLES2/gl2.h"
#include "EGL/egl.h"
#include "EGL/eglext.h"
#include <stdio.h>
#include <netdb.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <pthread.h>


float _time = 0;
int _activeShaderId = 0;
float _tiles = 1;
float _hide = 0;

#define BUFSIZE 1024

typedef struct {
  int sockfd; /* socket */
  int portno; /* port to listen on */
  int clientlen; /* byte size of client's address */
  struct sockaddr_in serveraddr; /* server's addr */
  struct sockaddr_in clientaddr; /* client addr */
  struct hostent *hostp; /* client host info */
  char buf[BUFSIZE]; /* message buf */
  char *hostaddrp; /* dotted decimal host addr string */
  int optval; /* flag value for setsockopt */
  int n; /* message byte size */
} UDP_STATE_T;

void error(char *msg) {
  perror(msg);
  exit(1);
}

void initSocket (UDP_STATE_T* _state, int portno) {

  _state->sockfd = socket(AF_INET, SOCK_DGRAM, 0);
  if (_state->sockfd < 0)
    error("ERROR opening socket");

  _state->optval = 1;
  setsockopt(_state->sockfd, SOL_SOCKET, SO_REUSEADDR,
	     (const void *)&(_state->optval) , sizeof(int));

  bzero((char *) &(_state->serveraddr), sizeof(_state->serveraddr));
  _state->serveraddr.sin_family = AF_INET;
  _state->serveraddr.sin_addr.s_addr = htonl(INADDR_ANY);
  _state->serveraddr.sin_port = htons((unsigned short)portno);

  /*
   * bind: associate the parent socket with a port
   */
  if (bind(_state->sockfd, (struct sockaddr *) &(_state->serveraddr),
	   sizeof(_state->serveraddr)) < 0)
    error("ERROR on binding");

  /*
   * main loop: wait for a datagram, then echo it
   */
  _state->clientlen = sizeof(_state->clientaddr);
  while (1) {

    bzero(_state->buf, BUFSIZE);
    _state->n = recvfrom(_state->sockfd, _state->buf, BUFSIZE, 0,
		 (struct sockaddr *) &(_state->clientaddr), &(_state->clientlen));
    if (_state->n < 0)
      error("ERROR in recvfrom");
/*
    _state->hostp = gethostbyaddr((const char *)&(_state->clientaddr.sin_addr.s_addr),
			  sizeof(_state->clientaddr.sin_addr.s_addr), AF_INET);
    if (_state->hostp == NULL)
      error("ERROR on gethostbyaddr");
    _state->hostaddrp = inet_ntoa(_state->clientaddr.sin_addr);
    if (_state->hostaddrp == NULL)
      error("ERROR on inet_ntoa\n");

    printf("packet = %d %d\n", _state->buf[0], _state->buf[1]);
*/
    if (_state->buf[0]==1) {
      _activeShaderId = (int)_state->buf[1];
    }

    if (_state->buf[0]==2) {
      _tiles = _state->buf[1];
      // printf("tiles = %d\n", _tiles);
    }

    if (_state->buf[0]==3) {
      _hide = _state->buf[1];
    }

    if (_state->buf[0]==0) {
      _time = 0;
    }

    // _state->n = sendto(_state->sockfd, _state->buf, strlen(_state->buf), 0,
	  //      (struct sockaddr *) &(_state->clientaddr), _state->clientlen);
    // if (_state->n < 0)
    //   error("ERROR in sendto");
  }
}


/* this function is run by the second thread */
void *udp_listen(void *x_void_ptr) {

  UDP_STATE_T udp_state;
  initSocket(&udp_state, 8888);
}



// int main() {
//
//   int x = 0, y = 0;
//   pthread_t udp_thread;
//
//   if(pthread_create(&udp_thread, NULL, udp_listen, &x)) {
//     fprintf(stderr, "Error creating thread\n");
//     return 1;
//   }
//
//   // MAIN THREAD
//   while(1) {
//
//   }
//
//   if(pthread_join(udp_thread, NULL)) {
//     fprintf(stderr, "Error joining thread\n");
//     return 2;
//   }
//   printf("x: %d, y: %d\n", x, y);
//   return 0;
// }









#define BUF_SIZE 1024*1024
#define N_SHADERS 1
#define MAX_SHADERS 8
#define CONFIG_FILE "./config.txt"

typedef struct {

  GLuint attr_vertex;

   uint32_t screen_width;
   uint32_t screen_height;

   EGLDisplay display;
   EGLSurface surface;
   EGLContext context;

   GLuint verbose;
   GLuint tex_fb;
   GLuint tex;
   GLuint buf;


   float time;
   int i,j,x0,y0,tiles;

} CUBE_STATE_T;

static CUBE_STATE_T _state, *state=&_state;

static const GLfloat vertex_data[] = {
     -1.0,-1.0,1.0,1.0,
     1.0,-1.0,1.0,1.0,
     1.0,1.0,1.0,1.0,
     -1.0,1.0,1.0,1.0
};

typedef struct {
  int reload;
  GLuint vshader;
  GLuint fshaders[24];
  GLuint program;
  GLuint uTime,
  uI,
  uJ,
  uW,
  uH,
  uX0,
  uY0,
  uHide,
  uTiles;
} SHADER_STATE_T;


static SHADER_STATE_T _shader, *shader=&_shader;
static SHADER_STATE_T _shader2, *shader2=&_shader2;

static SHADER_STATE_T shaders[MAX_SHADERS];

#define check() assert(glGetError() == 0)


static void loadFile (char* fname, GLchar* buffer) {

   FILE * pFile;
   long lSize;
   size_t result;

   pFile = fopen (fname , "r" );
   if (pFile==NULL) {
     fputs ("File error",stderr);
     exit (1);
   }

   // obtain file size:
   fseek (pFile , 0 , SEEK_END);
   lSize = ftell (pFile);
   rewind (pFile);

   // allocate memory to contain the whole file:
   // buffer = (char*) malloc (sizeof(char)*lSize);
   // if (buffer == NULL) {fputs ("Memory error",stderr); exit (2);}

   // copy the file into the buffer:
   result = fread (buffer, 1, lSize, pFile);
   if (result != lSize) {fputs ("Reading error",stderr); exit (3);}

   // terminate
   fclose (pFile);
}


static void showlog(GLint shader) {
   char log[1024];
   glGetShaderInfoLog(shader,sizeof log,NULL,log);
   printf("%d:shader:\n%s\n", shader, log);
}

static void showprogramlog(GLint shader) {

   char log[1024];
   glGetProgramInfoLog(shader,sizeof log,NULL,log);
   printf("%d:program:\n%s\n", shader, log);
}

static void init_ogl(CUBE_STATE_T *state) {

   int32_t success = 0;
   EGLBoolean result;
   EGLint num_config;

   static EGL_DISPMANX_WINDOW_T nativewindow;

   DISPMANX_ELEMENT_HANDLE_T dispman_element;
   DISPMANX_DISPLAY_HANDLE_T dispman_display;
   DISPMANX_UPDATE_HANDLE_T dispman_update;
   VC_RECT_T dst_rect;
   VC_RECT_T src_rect;

   static const EGLint attribute_list[] =
   {
      EGL_RED_SIZE, 8,
      EGL_GREEN_SIZE, 8,
      EGL_BLUE_SIZE, 8,
      EGL_ALPHA_SIZE, 8,
      EGL_SURFACE_TYPE, EGL_WINDOW_BIT,
      EGL_NONE
   };

   static const EGLint context_attributes[] =
   {
      EGL_CONTEXT_CLIENT_VERSION, 2,
      EGL_NONE
   };
   EGLConfig config;

   // get an EGL display connection
   state->display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
   assert(state->display!=EGL_NO_DISPLAY);
   check();

   // initialize the EGL display connection
   result = eglInitialize(state->display, NULL, NULL);
   assert(EGL_FALSE != result);
   check();

   // get an appropriate EGL frame buffer configuration
   result = eglChooseConfig(state->display, attribute_list, &config, 1, &num_config);
   assert(EGL_FALSE != result);
   check();

   // get an appropriate EGL frame buffer configuration
   result = eglBindAPI(EGL_OPENGL_ES_API);
   assert(EGL_FALSE != result);
   check();

   // create an EGL rendering context
   state->context = eglCreateContext(state->display, config, EGL_NO_CONTEXT, context_attributes);
   assert(state->context!=EGL_NO_CONTEXT);
   check();

   // create an EGL window surface
   success = graphics_get_display_size(0 /* LCD */, &state->screen_width, &state->screen_height);
   assert( success >= 0 );

   dst_rect.x = 0;
   dst_rect.y = 0;
   dst_rect.width = state->screen_width;
   dst_rect.height = state->screen_height;

   src_rect.x = 0;
   src_rect.y = 0;
   src_rect.width = state->screen_width << 16;
   src_rect.height = state->screen_height << 16;

   dispman_display = vc_dispmanx_display_open( 0 /* LCD */);
   dispman_update = vc_dispmanx_update_start( 0 );

   dispman_element = vc_dispmanx_element_add ( dispman_update, dispman_display,
      0/*layer*/, &dst_rect, 0/*src*/,
      &src_rect, DISPMANX_PROTECTION_NONE, 0 /*alpha*/, 0/*clamp*/, 0/*transform*/);

   nativewindow.element = dispman_element;
   nativewindow.width = state->screen_width;
   nativewindow.height = state->screen_height;
   vc_dispmanx_update_submit_sync( dispman_update );

   check();

   state->surface = eglCreateWindowSurface( state->display, config, &nativewindow, NULL );
   assert(state->surface != EGL_NO_SURFACE);
   check();

   // connect the context to the surface
   result = eglMakeCurrent(state->display, state->surface, state->surface, state->context);
   assert(EGL_FALSE != result);
   check();

   // Set background color and clear buffers
   glClearColor(0.15f, 0.25f, 0.35f, 1.0f);
   glClear( GL_COLOR_BUFFER_BIT );

   check();
}


static void init_shaders(CUBE_STATE_T *state, SHADER_STATE_T *shader, char* name) {




   const GLchar *vshader_source =
              "attribute vec4 vertex;"
              "varying vec2 tcoord;"
              "void main(void) {"
              " vec4 pos = vertex;"
              " gl_Position = pos;"
              " tcoord = vertex.xy*0.5+0.5;"
              "}";


  int i;

  shader->vshader = glCreateShader(GL_VERTEX_SHADER);
  glShaderSource (shader->vshader, 1, &vshader_source, 0);
  glCompileShader(shader->vshader);
  check();

  if (state->verbose)
    showlog(shader->vshader);

  GLchar *fshader_source = (GLchar*)malloc(BUF_SIZE);
  GLchar *fshader_source1 = (GLchar*)malloc(BUF_SIZE);
  GLchar *fshader_source2 = (GLchar*)malloc(BUF_SIZE);

  loadFile ("common.glsl", fshader_source1);
  loadFile (name, fshader_source2);

  sprintf(fshader_source, "%s%s", fshader_source1, fshader_source2);

  shader->fshaders[0] = glCreateShader(GL_FRAGMENT_SHADER);
  glShaderSource  (shader->fshaders[0], 1, &fshader_source, 0);
  glCompileShader (shader->fshaders[0]);
  check();

  if (state->verbose)
    showlog(shader->fshaders[0]);


  // fshader_source = (GLchar*)malloc(BUF_SIZE);
  // loadFile ("main.glsl", fshader_source);
  //
  // shader->fshaders[1] = glCreateShader(GL_FRAGMENT_SHADER);
  // glShaderSource  (shader->fshaders[1], 1, &fshader_source, 0);
  // glCompileShader (shader->fshaders[1]);
  // check();
  //
  // if (state->verbose)
  //   showlog(shader->fshaders[0]);


  shader->program = glCreateProgram();
  glAttachShader(shader->program, shader->vshader);
  glAttachShader(shader->program, shader->fshaders[0]);
  // glAttachShader(shader->program, shader->fshaders[1]);

  glLinkProgram(shader->program);
  check();

  if (state->verbose)
   showprogramlog(shader->program);








/*
     shader_states[cnt].vshader = glCreateShader(GL_VERTEX_SHADER);
     glShaderSource(shader_states[cnt].vshader, 1, &vshader_source, 0);
     glCompileShader(shader_states[cnt].vshader);
     check();

     if (state->verbose)
       showlog(shader_states[cnt].vshader);

     fshader_source = (GLchar*)malloc(BUF_SIZE);
     // char fname[32];
     // sprintf(fname, "shader%d.glsl", i);

     loadFile (fname, fshader_source);

     shader_states[cnt].fshader = glCreateShader(GL_FRAGMENT_SHADER);
     glShaderSource(shader_states[cnt].fshader, 1, &fshader_source, 0);
     glCompileShader(shader_states[cnt].fshader);
     check();

     if (state->verbose)
       showlog(shader_states[cnt].fshader);

     shader_states[i].program = glCreateProgram();
     glAttachShader(shader_states[cnt].program, shader_states[cnt].vshader);
     glAttachShader(shader_states[cnt].program, shader_states[cnt].fshader);
     glLinkProgram(shader_states[cnt].program);
     check();

     if (state->verbose)
      showprogramlog(shader_states[cnt].program);
*/
    shader->uTime = glGetUniformLocation(shader->program, "uTime");
    shader->uI = glGetUniformLocation(shader->program, "uI");
    shader->uJ = glGetUniformLocation(shader->program, "uJ");
    shader->uW = glGetUniformLocation(shader->program, "uW");
    shader->uH = glGetUniformLocation(shader->program, "uH");
    shader->uX0 = glGetUniformLocation(shader->program, "uX0");
    shader->uY0 = glGetUniformLocation(shader->program, "uY0");
    shader->uTiles = glGetUniformLocation(shader->program, "uTiles");
    shader->uHide = glGetUniformLocation(shader->program, "uHide");
    check();

  // glGenTextures(1, &state->tex);
  // check();
  //
  // glBindTexture(GL_TEXTURE_2D, state->tex);
  // check();
  // glActiveTexture(0)
  // glTexImage2D (GL_TEXTURE_2D, 0, GL_RGB, state->screen_width, state->screen_height, 0, GL_RGB,GL_UNSIGNED_SHORT_5_6_5,0);
  // check();
  //
  // glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
  // glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
  // check();

  // glGenFramebuffers(1, &state->tex_fb);
  // check();
  // glBindFramebuffer(GL_FRAMEBUFFER, state->tex_fb);
  // check();
  // glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, state->tex, 0);
  // check();
  // glBindFramebuffer(GL_FRAMEBUFFER, 0);
  // check();
}



static void draw_triangles (CUBE_STATE_T *state, GLfloat cx, GLfloat cy, GLfloat scale, GLfloat x, GLfloat y) {

  glBindFramebuffer(GL_FRAMEBUFFER,0);

  glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT);
  check();

  glBindBuffer(GL_ARRAY_BUFFER, state->buf);
  check();
  // glLinkProgram(shader_states[0].program);

  SHADER_STATE_T* activeShader;


  activeShader = &shaders[_activeShaderId];
  // activeShader = &shaders[0];

  glUseProgram (activeShader->program);

  check();
  // glBindTexture(GL_TEXTURE_2D, state->tex);
  // check();

  glUniform1f (activeShader->uTime, _time);
  glUniform1f (activeShader->uI, _I);
  glUniform1f (activeShader->uJ, _J);
  glUniform1f (activeShader->uW, state->screen_width);
  glUniform1f (activeShader->uH, state->screen_height);
  glUniform1f (activeShader->uX0, _I*1280);
  glUniform1f (activeShader->uY0, _J*(1024+150));
  glUniform1f (activeShader->uTiles, _tiles);
  glUniform1f (activeShader->uHide, _hide);

  state->time += 0.1;
  _time += 0.1;
  // check();

  glDrawArrays (GL_TRIANGLE_FAN, 0, 4);
  check();

  glBindBuffer (GL_ARRAY_BUFFER, 0);

  glFlush();
  glFinish();
  check();

  eglSwapBuffers (state->display, state->surface);
  check();
}


int main () {


  pthread_t udp_thread;

  int x;

  if(pthread_create(&udp_thread, NULL, udp_listen, &x)) {
    fprintf(stderr, "Error creating thread\n");
    return 1;
  }



   state->time = 0;
   state->i = _I;
   state->j = _J;

   state->screen_width = 1280;
   state->screen_height = 1024;
   state->x0 = _I*state->screen_width;
   state->y0 = _J*state->screen_height;
   state->tiles = 0;

   printf("%d %d\n", state->x0, state->y0);


   int terminate = 0;
   GLfloat cx, cy;
   bcm_host_init();

   // Clear application state
   memset( state, 0, sizeof( *state ) );

   // Start OGLES
   init_ogl(state);
   // init_shaders (state, shader, "common.glsl");
   // init_shaders (state, shader2, "common2.glsl");

   int i;
   for (i=0; i<4; i++) {
     char fname[32];
     sprintf(fname, "shader%d.glsl", i);
     init_shaders (state, &shaders[i], fname);
   }

   glClearColor (0.0, 1.0, 1.0, 1.0);
   glGenBuffers(1, &state->buf);

   check();

   // Prepare viewport
   glViewport (0, 0, state->screen_width, state->screen_height );
   check();

   // Upload vertex data to a buffer
   glBindBuffer (GL_ARRAY_BUFFER, state->buf);
   glBufferData (GL_ARRAY_BUFFER, sizeof(vertex_data),
                            vertex_data, GL_STATIC_DRAW);
   glVertexAttribPointer (state->attr_vertex, 4, GL_FLOAT, 0, 16, 0);
   glEnableVertexAttribArray (state->attr_vertex);
   check();

   cx = state->screen_width/2;
   cy = state->screen_height/2;

   while (!terminate) {
      int x, y, b;
      draw_triangles(state, cx, cy, 0.003, x, y);
   }

   return 0;
}
