#version 450 core

layout(location = 0) in vec3 vFragPos;
layout(location = 1) in vec3 vNormal;
layout(location = 2) in vec2 vTexCoord;

layout(location = 0) out vec4 FragColor;

uniform vec3 uCameraPos;
uniform float uTime;
uniform float uWireGlowIntensity; // Laser heat glow (0.0 to 1.0)
uniform vec3 uTungstenLightPos;

// Procedural wood grain & dust surface function
float woodGrain(vec2 uv) {
    float n = sin(uv.y * 80.0 + sin(uv.x * 20.0) * 4.0);
    return n * 0.5 + 0.5;
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uTungstenLightPos - vFragPos);
    vec3 V = normalize(uCameraPos - vFragPos);
    vec3 H = normalize(L + V);

    // 1. Warm Tungsten Lab Lighting (2700K warm incandescent glow)
    vec3 tungstenColor = vec3(1.0, 0.85, 0.65);
    float dist = length(uTungstenLightPos - vFragPos);
    float attenuation = 1.0 / (1.0 + 0.2 * dist * dist);

    // 2. Workbench Oak Wood Material with Varnish
    float grain = woodGrain(vTexCoord * 4.0);
    vec3 woodBase = mix(vec3(0.35, 0.20, 0.10), vec3(0.45, 0.28, 0.15), grain);

    // 3. Diffuse & Specular Highlights (Polished Varnish Sheen)
    float NdotL = max(dot(N, L), 0.0);
    float NdotH = max(dot(N, H), 0.0);
    float specularVarnish = pow(NdotH, 64.0) * 0.4;

    // 4. Laser Weld Searing Heat Glow on Wire Die
    vec3 laserGlow = vec3(1.0, 0.35, 0.05) * uWireGlowIntensity * 3.0 * (sin(uTime * 15.0) * 0.2 + 0.8);

    // 5. Green Phosphor CRT Screen Reflection
    vec3 crtBounceLight = vec3(0.1, 0.9, 0.3) * max(0.0, dot(N, vec3(0.0, 1.0, 0.5))) * 0.15;

    vec3 ambient = vec3(0.06, 0.05, 0.07);
    vec3 finalColor = (ambient + NdotL * tungstenColor * attenuation) * woodBase + specularVarnish * tungstenColor + laserGlow + crtBounceLight;

    FragColor = vec4(finalColor, 1.0);
}
