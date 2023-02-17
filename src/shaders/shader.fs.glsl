#version 300 es

precision highp float;

/** Interpolated texture coordinate */
in vec2 texCoord0;
/** Interpolated normal */
in vec3 normal;

in vec3 fragPos;

layout (location=0) out vec4 color;

struct DirectionalLight
{
    vec3 color;
    float intensity;
    vec3 direction;
    float diffuseIntensity;
};

struct Material
{
    float specularIntensity;
    float shininess;
};

uniform sampler2D texture0;
uniform DirectionalLight directionalLight;
uniform Material material;
uniform vec3 eyePos;

vec4 getSpecularColor(float diffuseFactor) {
    if (diffuseFactor <= 0.0) {
        return vec4(0, 0, 0, 0);
    }

    vec3 fragToEye = normalize(eyePos - fragPos);
    vec3 reflectedVertex = normalize(reflect(directionalLight.direction, normalize(normal)));

    float specularFactor = dot(fragToEye, reflectedVertex);
    if (specularFactor <= 0.0) {
        return vec4(0, 0, 0, 0);
    }

    specularFactor = pow(specularFactor, material.shininess);
    return vec4(directionalLight.color, 1.0) * material.specularIntensity * specularFactor;
}

void main() {
    vec4 ambientColor = vec4(directionalLight.color, 1.0) * directionalLight.intensity;

    float diffuseFactor = max(0.0, dot(normalize(normal), normalize(directionalLight.direction)));
    vec4 diffuseColor = vec4(directionalLight.color, 1.0) * directionalLight.diffuseIntensity * diffuseFactor;

    vec4 specularColor = getSpecularColor(diffuseFactor);

    color = texture(texture0, texCoord0) * (ambientColor + diffuseColor + specularColor);
}
