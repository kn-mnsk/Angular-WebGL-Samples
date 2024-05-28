#version 300 es

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

out vec4 FragColor;

void main() {
  FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
