#version 300 es

/** Vertex position */
layout (location=0) in vec3 position;
/** Texture coordinate */
layout (location=1) in vec2 texCoordIn;

uniform mat4 model;
uniform mat4 projection;
uniform mat4 view;

out vec4 vertexColor;
out vec2 texCoord0;

void main() {
    vertexColor = vec4(clamp(position, 0.0, 1.0), 1.0);
    gl_Position = projection * view * model * vec4(position, 1.0);
    texCoord0 = texCoordIn;
}
