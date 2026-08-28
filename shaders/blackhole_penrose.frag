#version 450 core

layout(location = 0) in vec3 vFragPos;
layout(location = 1) in vec3 vNormal;
layout(location = 2) in vec2 vTexCoord;

layout(location = 0) out vec4 FragColor;

uniform vec3 uCameraPos;
uniform float uTime;
uniform float uPenroseExtractionRate;

void main() {
    vec3 viewDir = normalize(vFragPos - uCameraPos);
    float distToSingularity = length(vFragPos);

    // 1. Schwarzschild Shadow (Event Horizon Sphere at r = 1.0)
    if (distToSingularity < 1.0) {
        FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Absolute pitch black event horizon
        return;
    }

    // 2. Gravitational Lensing Einstein Ring (Bending light around the singularity)
    float lensingFactor = 1.0 / pow(distToSingularity, 2.2);
    vec3 bentViewDir = normalize(viewDir + normalize(vFragPos) * lensingFactor * 0.8);

    // 3. Relativistic Accretion Disk & Frame-Dragging Loom
    // Swirling matter heated to relativistic temperatures with Doppler blue/redshift
    float diskRadius = length(vFragPos.xz);
    vec3 diskColor = vec3(0.0);

    if (diskRadius >= 1.5 && diskRadius <= 6.0 && abs(vFragPos.y) < 0.35) {
        float angle = atan(vFragPos.z, vFragPos.x);
        float dopplerShift = sin(angle); // Blue on approach, red on recede

        vec3 blueShift = vec3(0.3, 0.7, 1.0);
        vec3 redShift = vec3(1.0, 0.25, 0.05);
        vec3 baseDisk = mix(redShift, blueShift, dopplerShift * 0.5 + 0.5);

        float spiralBand = sin(diskRadius * 12.0 - angle * 4.0 - uTime * 8.0) * 0.5 + 0.5;
        diskColor = baseDisk * spiralBand * 3.5;
    }

    // 4. Penrose Process Energy Extraction Beams
    // Twin relativistic magnetic particle jets firing along polar axes
    float polarAlignment = abs(normalize(vFragPos).y);
    vec3 relativisticJet = vec3(0.6, 0.2, 1.0) * pow(polarAlignment, 16.0) * uPenroseExtractionRate * 4.0;

    // 5. Starfield & Cosmic Background Distortion
    vec3 starfield = vec3(0.02, 0.02, 0.05) + vec3(lensingFactor * 0.3);

    vec3 finalColor = starfield + diskColor + relativisticJet;
    FragColor = vec4(finalColor, 1.0);
}
