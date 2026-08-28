#version 450 core

layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;

// Per-instance attributes (from instanced buffer)
layout(location = 3) in mat4 aInstanceMatrix;
layout(location = 7) in vec4 aColorTint;
layout(location = 8) in float aMetallicWear;

layout(location = 0) out vec3 vFragPos;
layout(location = 1) out vec3 vNormal;
layout(location = 2) out vec2 vTexCoord;
layout(location = 3) out vec4 vColor;
layout(location = 4) out float vWear;

uniform mat4 uViewProj;
uniform float uLogConstant; // Computed by LogarithmicCamera

void main() {
    vec4 worldPosition = aInstanceMatrix * vec4(aPos, 1.0);
    vFragPos = worldPosition.xyz;
    
    mat3 normalMatrix = transpose(inverse(mat3(aInstanceMatrix)));
    vNormal = normalize(normalMatrix * aNormal);
    
    vTexCoord = aTexCoord;
    vColor = aColorTint;
    vWear = aMetallicWear;

    vec4 clipPos = uViewProj * worldPosition;

    // Logarithmic Reverse-Z Depth Output (Prevents Z-Fighting from 0.05m to 10^18m)
    clipPos.z = (log2(max(1e-6, 1.0 + clipPos.w)) * uLogConstant - 1.0) * clipPos.w;

    gl_Position = clipPos;
}
