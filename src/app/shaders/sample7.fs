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

uniform sampler2D uSampler;
in vec2 v_texcoord;
in vec3 v_lighting;

out vec4 FragColor;

void main() {
  vec4 texColor = texture(uSampler, v_texcoord);
  FragColor = vec4(texColor.rgb * v_lighting, texColor.a);
}
