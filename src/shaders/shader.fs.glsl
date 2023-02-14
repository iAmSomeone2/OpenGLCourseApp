#version 300 es

precision highp float;

in vec4 vertexColor;
in vec2 texCoord0;

layout (location=0) out vec4 color;

struct DirectionalLight
{
    vec3 color;
    float intensity;
};

uniform sampler2D texture0;
uniform DirectionalLight directionalLight;

void main(){
    vec4 ambientColor = vec4(directionalLight.color, 1.0) * directionalLight.intensity;

    color = texture(texture0, texCoord0) * ambientColor;
}
