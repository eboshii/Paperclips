#version 450 core

layout(location = 0) in vec3 vFragPos;
layout(location = 1) in vec3 vNormal;
layout(location = 2) in vec2 vTexCoord;
layout(location = 3) in float vElevation;

layout(location = 0) out vec4 FragColor;

uniform vec3 uCameraPos;
uniform vec3 uSunDir;
uniform float uConversionRatio; // 0.0 to 1.0
uniform int uScaleTier;          // 0 to 16

// Procedural Voronoi grid calculation for industrial circuit fissures
float voronoi(vec2 uv) {
    vec2 g = floor(uv);
    vec2 f = fract(uv);
    float minDist = 1.0;
    for (int y = -1; y <= 1; ++y) {
        for (int x = -1; x <= 1; ++x) {
            vec2 lattice = vec2(x, y);
            vec2 offset = sin(g + lattice) * 0.5 + 0.5;
            float d = length(lattice + offset - f);
            minDist = min(minDist, d);
        }
    }
    return minDist;
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uSunDir);
    vec3 V = normalize(uCameraPos - vFragPos);
    vec3 H = normalize(L + V);

    // 1. Base Albedo based on Scale Tier
    vec3 baseSurfaceColor;
    if (uScaleTier <= 7) {
        // Planetary Earth: Blue ocean & Green land
        vec3 oceanBlue = vec3(0.05, 0.25, 0.65);
        vec3 landGreen = vec3(0.15, 0.45, 0.20);
        float landMask = step(0.48, sin(vTexCoord.x * 12.0) * cos(vTexCoord.y * 8.0) * 0.5 + 0.5);
        baseSurfaceColor = mix(oceanBlue, landGreen, landMask);
    } else if (uScaleTier <= 9) {
        // Solar Dyson Era: Brilliant Gold Foil & Plasma Rings
        baseSurfaceColor = vec3(0.95, 0.75, 0.20); // Radiant solar gold
    } else if (uScaleTier <= 13) {
        // Galactic / Universal Era: Iridescent Dark Matter & Platinum
        baseSurfaceColor = vec3(0.35, 0.15, 0.55); // Deep cosmic violet
    } else {
        // Multiverse Era: Shifting chromatic hyper-space
        baseSurfaceColor = vec3(0.10, 0.85, 0.95);
    }

    // 2. Transformed Paperclip Metallic Alloy
    float wirePattern = sin(vTexCoord.x * 400.0) * cos(vTexCoord.y * 400.0);
    vec3 metallicAlloy;
    if (uScaleTier >= 8 && uScaleTier <= 9) {
        metallicAlloy = vec3(1.0, 0.85, 0.35) + vec3(wirePattern * 0.05); // Gold Dyson Mesh
    } else if (uScaleTier >= 10 && uScaleTier <= 13) {
        metallicAlloy = vec3(0.65, 0.45, 0.85) + vec3(wirePattern * 0.05); // Violet Dark-Matter Wire
    } else {
        metallicAlloy = vec3(0.90, 0.92, 0.96) + vec3(wirePattern * 0.08); // Chrome Steel
    }

    // 3. Emissive Neon Voronoi Fissures
    float fissure = 1.0 - smoothstep(0.0, 0.08, voronoi(vTexCoord * 60.0));
    vec3 fissureColor = (uScaleTier >= 8) ? vec3(1.0, 0.4, 0.0) : vec3(0.0, 0.9, 1.0);
    vec3 emissiveGlow = fissureColor * fissure * uConversionRatio * 2.5;

    // 4. Blend based on conversion progress
    vec3 albedo = mix(baseSurfaceColor, metallicAlloy, uConversionRatio);

    // Lighting (Diffuse + Specular)
    float NdotL = max(dot(N, L), 0.0);
    float NdotH = max(dot(N, H), 0.0);
    float specPower = mix(16.0, 128.0, uConversionRatio);
    float specular = pow(NdotH, specPower) * mix(0.1, 0.90, uConversionRatio);

    vec3 diffuse = NdotL * vec3(1.0, 0.98, 0.92);
    vec3 ambient = vec3(0.08, 0.10, 0.15);

    vec3 finalColor = (ambient + diffuse) * albedo + vec3(specular) + emissiveGlow;

    FragColor = vec4(finalColor, 1.0);
}
