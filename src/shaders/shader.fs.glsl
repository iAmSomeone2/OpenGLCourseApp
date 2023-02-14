#version 300 es

precision highp float;

in vec4 vertexColor;
in vec2 texCoord0;

layout (location=0) out vec4 color;

uniform sampler2D texture0;

void main(){
    color = texture(texture0, texCoord0);
}
