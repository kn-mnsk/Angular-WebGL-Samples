#version 300 es

// borrowed from https://github.com/atelechev/angular-webgl-template/tree/master/src/app/renderers/program/shaders
// precision mediump int;
// precision mediump float;
// precision highp float;
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

in vec4 v_color;

out vec4 FragColor;

void main() {
  FragColor = v_color;
}
