#version 450 core

layout(location = 0) in vec4 aPos4D; // 4D Coordinates (x, y, z, w)
layout(location = 1) in vec4 aColor;

layout(location = 0) out vec4 vColor;
layout(location = 1) out float vHyperDepth;

uniform mat4 uViewProj;
uniform float uLogConstant;
uniform float u4DRotationAngle; // Angle in XW / ZW 4D hyperplanes

// Rotate in 4D space (XW and YZ hyperplanes)
vec4 rotate4D(vec4 p, float theta) {
    float c = cos(theta);
    float s = sin(theta);

    // XW plane rotation
    vec4 r = p;
    r.x = p.x * c - p.w * s;
    r.w = p.x * s + p.w * c;

    // YZ plane rotation
    float c2 = cos(theta * 0.7);
    float s2 = sin(theta * 0.7);
    float tempY = r.y * c2 - r.z * s2;
    r.z = r.y * s2 + r.z * c2;
    r.y = tempY;

    return r;
}

void main() {
    vec4 rotated4D = rotate4D(aPos4D, u4DRotationAngle);

    // 4D to 3D Perspective Stereographic Projection (Distance = 2.5)
    float wDist = 2.5 - rotated4D.w;
    vec3 projected3D = rotated4D.xyz / max(0.1, wDist);

    vec4 clipPos = uViewProj * vec4(projected3D * 10.0, 1.0);
    clipPos.z = (log2(max(1e-6, 1.0 + clipPos.w)) * uLogConstant - 1.0) * clipPos.w;

    gl_Position = clipPos;
    vColor = aColor;
    vHyperDepth = rotated4D.w;
}
