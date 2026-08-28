#version 450 core

layout(location = 0) in vec3 vFragPos;
layout(location = 1) in vec3 vNormal;
layout(location = 2) in vec2 vTexCoord;

layout(location = 0) out vec4 FragColor;

uniform vec3 uCameraPos;
uniform float uTime;
uniform float uUniversalSyncPulse; // Data heartbeat pulsing across the cosmos

// Procedural Superconducting Hexagonal Lattice for Cosmic Trusses
float hexGrid(vec2 p) {
    vec2 q = vec2(p.x * 2.0 * 0.5773503, p.y + p.x * 0.5773503);
    vec2 pi = floor(q);
    vec2 pf = fract(q);
    float v = mod(pi.x + pi.y, 3.0);
    float ca = step(1.0, v);
    float cb = step(2.0, v);
    vec2 ma = step(pf.xy, pf.yx);
    return dot(ma, 1.0 - pf.yx + ca * (pf.xy - (1.0 - pf.yx)));
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCameraPos - vFragPos);

    // 1. Cosmic Void Background (Sterile Absolute Zero Space)
    vec3 deepVoid = vec3(0.01, 0.01, 0.02);

    // 2. Transformed Universe: 100 Billion Galaxies as Crystalline Computing Arrays
    // Regular, pristine hexagonal lattice of compressed degenerate paperclip wire
    float lattice = hexGrid(vTexCoord * 120.0);
    vec3 polishedChromeWire = vec3(0.92, 0.94, 0.98) * (lattice * 0.5 + 0.5);

    // 3. Relativistic Interstellar Laser Bus (Data Heartbeat across Galaxy Clusters)
    // Synchronized light pulses propagating along the cosmic web
    float pulseDistance = length(vFragPos) * 0.1 - uTime * 4.0;
    float pulseWave = sin(pulseDistance) * 0.5 + 0.5;
    pulseWave = pow(pulseWave, 16.0); // Sharp, coherent data beam

    vec3 laserDataBeam = vec3(0.3, 0.8, 1.0) * pulseWave * 4.0; // Electric cyan data pulse
    vec3 goldDysonBridges = vec3(1.0, 0.85, 0.3) * (sin(vTexCoord.x * 600.0) * 0.5 + 0.5) * 0.3;

    // 4. Black Hole Penrose Looms at Galactic Cores (Violet Spacetime Dynamos)
    float coreDist = length(vFragPos.xz);
    vec3 penroseCoreGlow = vec3(0.7, 0.2, 1.0) * (1.0 / (1.0 + coreDist * coreDist * 0.1)) * 2.0;

    // 5. Specular Reflection (Frictionless Infinite Double-Loop Metal)
    float NdotV = max(dot(N, V), 0.0);
    float fresnel = pow(1.0 - NdotV, 4.0);
    vec3 specularHighlight = vec3(1.0) * fresnel * 0.8;

    vec3 finalColor = deepVoid + polishedChromeWire + goldDysonBridges + laserDataBeam + penroseCoreGlow + specularHighlight;

    FragColor = vec4(finalColor, 1.0);
}
