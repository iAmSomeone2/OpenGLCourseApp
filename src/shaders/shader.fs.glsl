#version 300 es

precision highp float;

in vec4 vertexColor;

layout (location=0) out vec4 color;

void main(){
    // color = vec4(1.0, 0.0, 0.0, 1.0);
    color = vertexColor;
}
