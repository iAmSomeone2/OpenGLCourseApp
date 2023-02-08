#version 300 es

/** Vertex position */
layout (location=0) in vec3 position;

uniform mat4 model;
uniform mat4 projection;

out vec4 vertexColor;

void main() {
    vertexColor = vec4(clamp(position, 0.0, 1.0), 1.0);
    gl_Position = projection * model * vec4(position, 1.0);
}
