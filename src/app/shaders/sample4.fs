#version 300 es

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
