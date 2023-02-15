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

out vec4 vertexColor;
out vec2 texCoord0;
out vec3 normal;

void main() {
    gl_Position = projection * view * model * vec4(position, 1.0);

    texCoord0 = texCoordIn;

    normal = mat3(transpose(inverse(model))) * norm;
}
