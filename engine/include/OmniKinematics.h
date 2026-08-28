#pragma once
#include <vector>
#include <array>
#include <cmath>
#include <iostream>

namespace OmniEngine {

struct Vertex3D {
    float position[3];
    float normal[3];
    float uv[2];
};

struct MeshData {
    std::vector<Vertex3D> vertices;
    std::vector<uint32_t> indices;
};

enum class MachineStage {
    Idle,
    WireFeed,      // Rollers feed straight wire
    HydraulicFold, // Mandrel pins slam down
    ShearAndEject  // Blade cuts, air blast shoots clip forward
};

struct HydraulicKinematics {
    MachineStage currentStage = MachineStage::Idle;
    float stageTimer = 0.0f;
    float cycleDuration = 0.16f; // 160ms total cycle

    // Machine component transforms
    float rollerRotationDeg = 0.0f;
    float stamperHeightNorm = 1.0f; // 1.0 = raised, 0.0 = fully slammed
    float stamperVelocity = 0.0f;
    float wireExtendNorm = 0.0f;    // 0.0 = in die, 1.0 = fully extended
    float shearOffsetNorm = 0.0f;   // 0.0 = open, 1.0 = cut

    // Spring physics constants for tactile recoil
    const float springK = 350.0f;
    const float springDamping = 18.0f;

    int queuedCycles = 0;

    void TriggerCycle() {
        if (currentStage == MachineStage::Idle) {
            currentStage = MachineStage::WireFeed;
            stageTimer = 0.0f;
            wireExtendNorm = 0.0f;
            stamperHeightNorm = 1.0f;
            stamperVelocity = 0.0f;
            shearOffsetNorm = 0.0f;
        } else {
            queuedCycles++;
        }
    }

    void Update(float dt, bool& outClipEjected, bool& outSparksEmitted) {
        outClipEjected = false;
        outSparksEmitted = false;

        if (currentStage == MachineStage::Idle) {
            // Settle stamper back to 1.0 via spring
            float displacement = 1.0f - stamperHeightNorm;
            float force = springK * displacement - springDamping * stamperVelocity;
            stamperVelocity += force * dt;
            stamperHeightNorm += stamperVelocity * dt;
            return;
        }

        stageTimer += dt;

        // Stage 1: Wire Feed (0.00s to 0.04s)
        if (stageTimer < 0.04f) {
            currentStage = MachineStage::WireFeed;
            float progress = stageTimer / 0.04f;
            wireExtendNorm = progress;
            rollerRotationDeg += dt * 720.0f; // Spin feed rollers
        }
        // Stage 2: Hydraulic Slam (0.04s to 0.12s)
        else if (stageTimer < 0.12f) {
            if (currentStage != MachineStage::HydraulicFold) {
                currentStage = MachineStage::HydraulicFold;
                outSparksEmitted = true; // Emit sparks on impact
            }
            float foldProgress = (stageTimer - 0.04f) / 0.08f;
            // Snappy slam down with squash
            stamperHeightNorm = std::max(0.0f, 1.0f - std::sin(foldProgress * 3.14159f) * 1.05f);
        }
        // Stage 3: Shear Cut & Eject (0.12s to 0.16s)
        else if (stageTimer < 0.16f) {
            currentStage = MachineStage::ShearAndEject;
            float shearProgress = (stageTimer - 0.12f) / 0.04f;
            shearOffsetNorm = std::sin(shearProgress * 3.14159f);
        }
        // Complete
        else {
            outClipEjected = true;
            stamperHeightNorm = 0.9f;
            stamperVelocity = 5.0f; // Kick stamper up with spring recoil

            if (queuedCycles > 0) {
                queuedCycles--;
                currentStage = MachineStage::WireFeed;
                stageTimer = 0.0f;
                wireExtendNorm = 0.0f;
            } else {
                currentStage = MachineStage::Idle;
            }
        }
    }
};

/// <summary>
/// Procedural 3D Mesh Generator for smooth curved steel paperclips.
/// Generates cylindrical extruded geometry along a multi-segment Bezier path.
/// </summary>
class ProceduralWireBuilder {
public:
    static MeshData GeneratePaperclipMesh(float wireRadius = 0.02f, int radialSegments = 8) {
        MeshData mesh;

        // Key control points for the 4 concentric loops of a standard paperclip
        // (Outer straight -> Large top loop -> Long outer leg -> Medium bottom loop -> Inner leg -> Small inner loop -> End)
        std::vector<std::array<float, 3>> pathPoints;
        
        // 1. Initial outer straight
        for (int i = 0; i <= 10; ++i) {
            float y = -0.5f + (i / 10.0f) * 0.9f;
            pathPoints.push_back({ -0.2f, y, 0.0f });
        }

        // 2. Large top semi-circle (Radius = 0.2f)
        for (int i = 1; i <= 12; ++i) {
            float angle = 3.14159265f - (i / 12.0f) * 3.14159265f;
            float x = 0.0f + std::cos(angle) * 0.2f;
            float y = 0.4f + std::sin(angle) * 0.2f;
            pathPoints.push_back({ x, y, 0.0f });
        }

        // 3. Long outer descending leg
        for (int i = 1; i <= 14; ++i) {
            float y = 0.4f - (i / 14.0f) * 1.0f;
            pathPoints.push_back({ 0.2f, y, 0.0f });
        }

        // 4. Bottom medium semi-circle (Radius = 0.16f)
        for (int i = 1; i <= 12; ++i) {
            float angle = 0.0f - (i / 12.0f) * 3.14159265f;
            float x = 0.04f + std::cos(angle) * 0.16f;
            float y = -0.6f + std::sin(angle) * 0.16f;
            pathPoints.push_back({ x, y, 0.0f });
        }

        // 5. Inner ascending leg
        for (int i = 1; i <= 10; ++i) {
            float y = -0.6f + (i / 10.0f) * 0.8f;
            pathPoints.push_back({ -0.12f, y, 0.0f });
        }

        // 6. Inner small top loop (Radius = 0.10f)
        for (int i = 1; i <= 8; ++i) {
            float angle = 3.14159265f - (i / 8.0f) * 3.14159265f;
            float x = -0.02f + std::cos(angle) * 0.10f;
            float y = 0.2f + std::sin(angle) * 0.10f;
            pathPoints.push_back({ x, y, 0.0f });
        }

        // 7. Final inner end tip
        for (int i = 1; i <= 6; ++i) {
            float y = 0.2f - (i / 6.0f) * 0.4f;
            pathPoints.push_back({ 0.08f, y, 0.0f });
        }

        // Extrude tubular mesh along path
        size_t pathCount = pathPoints.size();
        for (size_t p = 0; p < pathCount; ++p) {
            auto pt = pathPoints[p];
            float tangent[3] = { 0.0f, 1.0f, 0.0f };
            if (p + 1 < pathCount) {
                tangent[0] = pathPoints[p + 1][0] - pt[0];
                tangent[1] = pathPoints[p + 1][1] - pt[1];
                tangent[2] = pathPoints[p + 1][2] - pt[2];
            } else if (p > 0) {
                tangent[0] = pt[0] - pathPoints[p - 1][0];
                tangent[1] = pt[1] - pathPoints[p - 1][1];
                tangent[2] = pt[2] - pathPoints[p - 1][2];
            }
            float len = std::sqrt(tangent[0]*tangent[0] + tangent[1]*tangent[1] + tangent[2]*tangent[2]);
            if (len > 1e-6f) { tangent[0] /= len; tangent[1] /= len; tangent[2] /= len; }

            // Generate circular ring perpendicular to tangent
            for (int r = 0; r < radialSegments; ++r) {
                float phi = (static_cast<float>(r) / radialSegments) * 6.2831853f;
                float nx = std::cos(phi);
                float nz = std::sin(phi);

                Vertex3D vert;
                vert.position[0] = pt[0] + nx * wireRadius;
                vert.position[1] = pt[1];
                vert.position[2] = pt[2] + nz * wireRadius;

                vert.normal[0] = nx;
                vert.normal[1] = 0.0f;
                vert.normal[2] = nz;

                vert.uv[0] = static_cast<float>(r) / radialSegments;
                vert.uv[1] = static_cast<float>(p) / pathCount;

                mesh.vertices.push_back(vert);
            }
        }

        // Build triangle indices connecting rings
        for (size_t p = 0; p + 1 < pathCount; ++p) {
            uint32_t ringStartA = static_cast<uint32_t>(p * radialSegments);
            uint32_t ringStartB = static_cast<uint32_t>((p + 1) * radialSegments);

            for (int r = 0; r < radialSegments; ++r) {
                uint32_t nextR = (r + 1) % radialSegments;

                uint32_t a0 = ringStartA + r;
                uint32_t a1 = ringStartA + nextR;
                uint32_t b0 = ringStartB + r;
                uint32_t b1 = ringStartB + nextR;

                // Triangle 1
                mesh.indices.push_back(a0);
                mesh.indices.push_back(b0);
                mesh.indices.push_back(a1);

                // Triangle 2
                mesh.indices.push_back(a1);
                mesh.indices.push_back(b0);
                mesh.indices.push_back(b1);
            }
        }

        return mesh;
    }
};

} // namespace OmniEngine
