#version 300 es

// borrowed from https://github.com/atelechev/angular-webgl-template/tree/master/src/app/renderers/program/shaders

layout(std140) uniform;

layout(location = 0) in vec2 a_position;

uniform mat4 model;
uniform mat4 projection;


void main() {
  gl_Position = projection * model * vec4(a_position, 0.0, 1.0);
}
