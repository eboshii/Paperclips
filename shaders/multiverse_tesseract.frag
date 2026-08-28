#version 450 core

layout(location = 0) in vec4 vColor;
layout(location = 1) in float vHyperDepth;

layout(location = 0) out vec4 FragColor;

uniform float uTime;

void main() {
    // Hyper-dimensional pulsing chromatic neon effect
    float pulse = sin(uTime * 4.0 + vHyperDepth * 3.14159) * 0.5 + 0.5;
    vec3 hyperGlow = mix(vec3(0.1, 0.9, 1.0), vec3(1.0, 0.2, 0.8), pulse);

    vec4 finalColor = vColor * vec4(hyperGlow * 1.8, 1.0);
    FragColor = finalColor;
}
