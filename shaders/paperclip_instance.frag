#version 450 core

layout(location = 0) in vec3 vFragPos;
layout(location = 1) in vec3 vNormal;
layout(location = 2) in vec2 vTexCoord;
layout(location = 3) in vec4 vColor;
layout(location = 4) in float vWear;

layout(location = 0) out vec4 FragColor;

uniform vec3 uCameraPos;
uniform vec3 uKeyLightDir;
uniform vec3 uKeyLightColor;
uniform vec3 uFillLightColor;

void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCameraPos - vFragPos);
    vec3 L = normalize(uKeyLightDir);
    vec3 H = normalize(L + V);

    // Diffuse
    float NdotL = max(dot(N, L), 0.0);
    vec3 diffuse = NdotL * uKeyLightColor;

    // Specular (Blinn-Phong Metallic Shine)
    float NdotH = max(dot(N, H), 0.0);
    float specPower = mix(128.0, 32.0, vWear);
    float specular = pow(NdotH, specPower);

    // Ambient / Environment Fill
    vec3 ambient = uFillLightColor * 0.2;

    // Base chrome metallic albedo
    vec3 chromeAlbedo = mix(vec3(0.92, 0.94, 0.96), vColor.rgb, 0.2);
    vec3 finalColor = (ambient + diffuse) * chromeAlbedo + specular * vec3(1.0, 1.0, 1.0) * (1.0 - vWear * 0.5);

    FragColor = vec4(finalColor, 1.0);
}
