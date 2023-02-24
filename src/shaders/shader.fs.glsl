#version 300 es

precision highp float;

const uint MAX_POINT_LIGHTS = 3u;

struct Light
{
    vec3 color;
    float intensity;
    float diffuseIntensity;
};

struct DirectionalLight
{
    Light base;
    vec3 direction;
};

struct PointLight
{
    Light base;
    vec3 position;
    float constant;
    float linear;
    float exponent;
};

struct Material
{
    float specularIntensity;
    float shininess;
};

/** Interpolated texture coordinate */
in vec2 texCoord0;
/** Interpolated normal */
in vec3 normal;

in vec3 fragPos;

layout (location=0) out vec4 color;

// Lights
uniform DirectionalLight directionalLight;
uniform PointLight pointLights[MAX_POINT_LIGHTS];
uniform uint pointLightCount;

// Textures & materials
uniform sampler2D texture0;
uniform Material material;


uniform vec3 eyePos;

vec4 calculateLightByDirection(Light light, vec3 direction) {
    vec4 ambientColor = vec4(light.color, 1.0) * light.intensity;

    float diffuseFactor = max(0.0, dot(normalize(normal), normalize(direction)));
    vec4 diffuseColor = vec4(light.color, 1.0) * light.diffuseIntensity * diffuseFactor;
    vec4 specularColor = vec4(0, 0, 0, 0);

    if (diffuseFactor > 0.0) {
        vec3 fragToEye = normalize(eyePos - fragPos);
        vec3 reflectedVertex = normalize(reflect(directionalLight.direction, normalize(normal)));

        float specularFactor = dot(fragToEye, reflectedVertex);
        if (specularFactor > 0.0) {
            specularFactor = pow(specularFactor, material.shininess);
            specularColor = vec4(light.color, 1.0) * material.specularIntensity * specularFactor;
        }
    }
    
    return ambientColor + diffuseColor + specularColor;
}

vec4 calculateDirectionalLight() {
    return calculateLightByDirection(directionalLight.base, directionalLight.direction);
}

vec4 calculatePointLights() {
    vec4 totalColor = vec4(0.0, 0.0, 0.0, 0.0);
    for (uint i = 0u; i < pointLightCount; i++) {
        vec3 direction = fragPos - pointLights[i].position;
        float dist = length(direction);
        direction = normalize(direction);

        vec4 color = calculateLightByDirection(pointLights[i].base, direction);
        float attenuation = pointLights[i].exponent * dist * dist +
            pointLights[i].linear * dist +
            pointLights[i].constant;
        
        totalColor += color / attenuation;
    }

    return totalColor;
}

void main() {
    vec4 finalColor = calculateDirectionalLight();
    finalColor += calculatePointLights();

    color = texture(texture0, texCoord0) * finalColor;
}
