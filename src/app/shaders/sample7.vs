#version 300 es

// borrowed from https://github.com/atelechev/angular-webgl-template/tree/master/src/app/renderers/program/shaders

layout(std140) uniform;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_texcoord;

uniform mat4 model;
uniform mat4 projection;
uniform mat4 normal;

out vec2 v_texcoord;
out vec3 v_lighting;

void main() {
  gl_Position = projection * model * vec4(a_position, 1.0f);

  v_texcoord = a_texcoord;

// Apply lighting effect

  float intensity1 = 0.6;
  float intensity2 = 1.5;
  vec3 ambientLight = intensity1 * vec3(1.0f, 1.0, 1.0);
  vec3 directionalLightColor = intensity2 * vec3(1, 1, 1);
  highp vec3 directionalVector = normalize(vec3(0.85f, 0.8f, 0.75f));

  vec4 transformedNormal = normal * vec4(a_normal, 1.0f);

  float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0f);

  v_lighting = ambientLight + (directionalLightColor * directional);

}
