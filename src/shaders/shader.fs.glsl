#version 300 es

precision highp float;

/** Interpolated texture coordinate */
in vec2 texCoord0;
/** Interpolated normal */
in vec3 normal;

layout (location=0) out vec4 color;

struct DirectionalLight
{
    vec3 color;
    float intensity;
    vec3 direction;
    float diffuseIntensity;
};

uniform sampler2D texture0;
uniform DirectionalLight directionalLight;

void main(){
    vec4 ambientColor = vec4(directionalLight.color, 1.0) * directionalLight.intensity;

    float diffuseFactor = max(0.0, dot(normalize(normal), normalize(directionalLight.direction)));
    vec4 diffuseColor = vec4(directionalLight.color, 1.0) * directionalLight.diffuseIntensity * diffuseFactor;

    color = texture(texture0, texCoord0) * (ambientColor + diffuseColor);
}
