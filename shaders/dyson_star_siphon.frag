#version 450 core

layout(location = 0) in vec3 vFragPos;
layout(location = 1) in vec3 vNormal;
layout(location = 2) in vec2 vTexCoord;

layout(location = 0) out vec4 FragColor;

uniform vec3 uCameraPos;
uniform float uTime;
uniform float uSiphonActivity; // 0.0 to 1.0

// Procedural Solar Flare turbulence
float solarNoise(vec3 p) {
    return sin(p.x * 4.0 + uTime * 2.0) * sin(p.y * 4.0 + uTime * 1.5) * sin(p.z * 4.0 + uTime * 3.0);
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCameraPos - vFragPos);

    // 1. Blazing Solar Corona Core (6000K Photosphere)
    float flare = solarNoise(vFragPos * 0.5) * 0.5 + 0.5;
    vec3 sunCoreColor = mix(vec3(1.0, 0.65, 0.15), vec3(1.0, 0.95, 0.70), flare);

    // 2. Ultra-Thin Mylar Gold Dyson Collector Sails
    // High anisotropic reflection with golden specular glints
    float sailPattern = sin(vTexCoord.x * 200.0) * cos(vTexCoord.y * 200.0);
    vec3 goldFoilColor = vec3(1.0, 0.82, 0.25) + vec3(sailPattern * 0.1);

    // 3. Magnetic Confinement Plasma Siphon Vortex
    // Swirling ribbons of ionized plasma being pulled into orbital collectors
    float vortexTwist = sin(atan(vFragPos.z, vFragPos.x) * 8.0 + vFragPos.y * 5.0 - uTime * 6.0);
    vec3 plasmaRibbon = vec3(0.2, 0.8, 1.0) * max(0.0, vortexTwist) * uSiphonActivity * 2.0;

    // 4. Fresnel Limb Darkening / Glow
    float fresnel = 1.0 - max(dot(N, V), 0.0);
    vec3 coronaGlow = vec3(1.0, 0.45, 0.05) * pow(fresnel, 3.0) * 3.0;

    vec3 finalColor = goldFoilColor * 0.4 + sunCoreColor * 0.6 + plasmaRibbon + coronaGlow;

    FragColor = vec4(finalColor, 1.0);
}
