#version 300 es

precision highp float;

/** Vertex position */
layout (location=0) in vec3 position;
/** Texture coordinate */
layout (location=1) in vec2 texCoordIn;
/** Vertex normal */
layout (location=2) in vec3 norm;

uniform mat4 model;
uniform mat4 projection;
uniform mat4 view;

out vec2 texCoord0;
out vec3 normal;
out vec3 fragPos;

void main() {
    vec4 modelPosition = model * vec4(position, 1.0);
    gl_Position = projection * view * modelPosition;

    texCoord0 = texCoordIn;

    normal = mat3(transpose(inverse(model))) * norm;
    fragPos = modelPosition.xyz;
}
