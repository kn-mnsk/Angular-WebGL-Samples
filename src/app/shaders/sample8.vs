#version 300 es

// borrowed from https://github.com/mdn/dom-examples/blob/main/webgl-examples/tutorial/sample8/webgl-demo.js

layout(std140) uniform;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_texcoord;

uniform mat4 normal;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec2 v_texcoord;
out vec3 v_lighting;

void main() {
  gl_Position = projection * model * vec4(a_position, 1.0);
  v_texcoord = a_texcoord;

 // Apply lighting effect

    vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    vec3 directionalLightColor = vec3(1, 1, 1);
    vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    vec4 transformedNormal = normal * vec4(a_normal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);

    v_lighting = ambientLight + (directionalLightColor * directional);
}
