#version 450 core

layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;

layout(location = 0) out vec3 vFragPos;
layout(location = 1) out vec3 vNormal;
layout(location = 2) out vec2 vTexCoord;
layout(location = 3) out float vElevation;

uniform mat4 uModel;
uniform mat4 uViewProj;
uniform float uLogConstant;
uniform float uConversionRatio; // 0.0 = Blue Earth, 1.0 = Fully Metallic Paperclip Crust

void main() {
    vec3 normal = normalize(aNormal);
    
    // Procedural geometric facet displacement as terrain transforms into industrial metal
    float facetDisplacement = sin(aPos.x * 40.0) * cos(aPos.z * 40.0) * 0.015 * uConversionRatio;
    vec3 displacedPos = aPos + normal * facetDisplacement;

    vec4 worldPos = uModel * vec4(displacedPos, 1.0);
    vFragPos = worldPos.xyz;
    vNormal = normalize(mat3(transpose(inverse(uModel))) * normal);
    vTexCoord = aTexCoord;
    vElevation = facetDisplacement;

    vec4 clipPos = uViewProj * worldPos;
    // Logarithmic Reverse-Z Depth Output
    clipPos.z = (log2(max(1e-6, 1.0 + clipPos.w)) * uLogConstant - 1.0) * clipPos.w;

    gl_Position = clipPos;
}
