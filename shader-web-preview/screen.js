var VERT_SRC =
   'attribute vec3 coordinates;' +

   'void main(void) {' +
      'gl_Position = vec4(coordinates, 1.0);' +
   '}';

function Shader(gl, vertSrc, fragSrc) {

  this.gl = gl;
  this.uniforms = [];

  this.fragSrc = fragSrc;
  this.vertSrc = vertSrc;

  // Create a vertex shader object
  this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);

  // Attach vertex shader source code
  this.gl.shaderSource(this.vertShader, this.vertSrc);

  // Compile the vertex shader
  this.gl.compileShader(this.vertShader);

  // Create fragment shader object
  this.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

  // Attach fragment shader source code
  this.gl.shaderSource(this.fragShader, this.fragSrc);

  // Compile the fragmentt shader
  this.gl.compileShader(this.fragShader);

  this.shaderProgram = this.gl.createProgram();

  this.gl.attachShader(this.shaderProgram, this.vertShader);

  // Attach a fragment shader
  this.gl.attachShader(this.shaderProgram, this.fragShader);

  // Link both the programs
  this.gl.linkProgram(this.shaderProgram);

  // Use the combined shader program object
  this.gl.useProgram(this.shaderProgram);
}


function Screen (x, y, w, h) {

  this.canvas = document.createElement("canvas");
  this.canvas.width = w;
  this.canvas.height = h;
  // this.canvas.style.width = w+"px";
  // this.canvas.style.height = h+"px";
  this.canvas.style.left = x+"px";
  this.canvas.style.top = y+"px";
  this.canvas.style.position = "absolute";

  document.body.appendChild(this.canvas);
  this.gl = this.canvas.getContext('experimental-webgl');

   var vertices = [
     -1,1,0.0,
     -1,-1,0.0,
     1,-1,0.0,
     1,-1,0.0,
     1,1,0.0,
     -1,1,0.0,
   ];

   indices = [0,1,2,3,4,5];

   // Create an empty buffer object to store vertex buffer
   this.vertex_buffer = this.gl.createBuffer();

   // Bind appropriate array buffer to it
   this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);

   // Pass the vertex data to the buffer
   this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

   // Unbind the buffer
   this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

   // Create an empty buffer object to store Index buffer
   this.Index_Buffer = this.gl.createBuffer();

   // Bind appropriate array buffer to it
   this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.Index_Buffer);

   // Pass the vertex data to the buffer
   this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

   // Unbind the buffer
   this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

   this.shaders = [];
 }

 Screen.prototype.addShader = function (fragSrc) {
   this.shaders.push(new Shader (this.gl, VERT_SRC, fragSrc))
   this.shader = this.shaders[this.shaders.length-1];
 }

 Screen.prototype.activateShader = function(s) {
   this.shader = this.shaders[s];
 }


 Screen.prototype.draw = function() {

    this.gl.useProgram(this.shader.shaderProgram);

   for (var key of Object.keys(this.shader.uniforms)) {
    this.gl.uniform1f(this.shader.uniforms[key], this[key]);
   }

   this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer);
   this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.Index_Buffer);

   var coord = this.gl.getAttribLocation(this.shader.shaderProgram, "coordinates");
   this.gl.vertexAttribPointer(coord, 3, this.gl.FLOAT, false, 0, 0);
   this.gl.enableVertexAttribArray(coord);

   this.gl.clearColor(0, 0, 0, 1);
   this.gl.enable(this.gl.DEPTH_TEST);
   this.gl.clear(this.gl.COLOR_BUFFER_BIT);
   this.gl.viewport(0,0,this.canvas.width,this.canvas.height);

   this.gl.drawElements(this.gl.TRIANGLES, indices.length, this.gl.UNSIGNED_SHORT,0);
 }


 Screen.prototype.addUniform = function (key, val=0) {
   for (var i=0; i<this.shaders.length; i++) {
     this.gl.useProgram(this.shaders[i].shaderProgram);
     this.shaders[i].uniforms[key] = this.gl.getUniformLocation(this.shaders[i].shaderProgram, key);
     this[key] = val;
   }
 }
