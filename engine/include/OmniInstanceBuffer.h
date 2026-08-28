#pragma once
#include <vector>
#include <random>
#include <cmath>
#include <iostream>
#include "OmniRender.h"

namespace OmniEngine {

struct PhysicalClip {
    float pos[3];
    float vel[3];
    float rotEuler[3];
    float rotVel[3];
    bool settled;
};

/// <summary>
/// High-throughput GPU Instanced buffer manager.
/// Tracks and simulates up to 100,000 physical paperclips clinking and settling into collection bins.
/// </summary>
class InstancedClipManager {
public:
    InstancedClipManager(size_t maxCapacity = 100000)
        : m_maxCapacity(maxCapacity), m_rng(42) {
        m_physicsClips.reserve(maxCapacity);
        m_gpuInstances.reserve(maxCapacity);
    }

    void SpawnClip(float originX, float originY, float originZ) {
        if (m_physicsClips.size() >= m_maxCapacity) {
            // Recycle oldest clip if at max capacity
            m_physicsClips.erase(m_physicsClips.begin());
            m_gpuInstances.erase(m_gpuInstances.begin());
        }

        std::uniform_real_distribution<float> distVelX(1.5f, 3.5f); // Eject forward into bin
        std::uniform_real_distribution<float> distVelY(1.0f, 2.5f); // Arc up
        std::uniform_real_distribution<float> distVelZ(-0.5f, 0.5f);
        std::uniform_real_distribution<float> distRotVel(-10.0f, 10.0f);

        PhysicalClip clip;
        clip.pos[0] = originX; clip.pos[1] = originY; clip.pos[2] = originZ;
        clip.vel[0] = distVelX(m_rng);
        clip.vel[1] = distVelY(m_rng);
        clip.vel[2] = distVelZ(m_rng);
        clip.rotEuler[0] = 0.0f; clip.rotEuler[1] = 0.0f; clip.rotEuler[2] = 0.0f;
        clip.rotVel[0] = distRotVel(m_rng);
        clip.rotVel[1] = distRotVel(m_rng);
        clip.rotVel[2] = distRotVel(m_rng);
        clip.settled = false;

        m_physicsClips.push_back(clip);

        InstanceData inst;
        inst.colorTint[0] = 0.95f; inst.colorTint[1] = 0.95f; inst.colorTint[2] = 0.98f; inst.colorTint[3] = 1.0f;
        inst.metallicWear = 0.1f;
        m_gpuInstances.push_back(inst);
    }

    void UpdatePhysics(float dt) {
        const float gravity = -9.81f;
        const float binFloorY = 0.02f;
        const float binMinX = 0.8f, binMaxX = 2.2f;
        const float binMinZ = -0.6f, binMaxZ = 0.6f;

        size_t count = m_physicsClips.size();
        for (size_t i = 0; i < count; ++i) {
            auto& clip = m_physicsClips[i];
            if (clip.settled) continue;

            clip.vel[1] += gravity * dt;
            clip.pos[0] += clip.vel[0] * dt;
            clip.pos[1] += clip.vel[1] * dt;
            clip.pos[2] += clip.vel[2] * dt;

            clip.rotEuler[0] += clip.rotVel[0] * dt;
            clip.rotEuler[1] += clip.rotVel[1] * dt;
            clip.rotEuler[2] += clip.rotVel[2] * dt;

            // Collision with Collection Bin Walls
            if (clip.pos[0] > binMaxX) { clip.pos[0] = binMaxX; clip.vel[0] = -clip.vel[0] * 0.4f; }
            if (clip.pos[0] < binMinX && clip.pos[1] < 0.3f) { clip.pos[0] = binMinX; clip.vel[0] = -clip.vel[0] * 0.4f; }
            if (clip.pos[2] > binMaxZ) { clip.pos[2] = binMaxZ; clip.vel[2] = -clip.vel[2] * 0.4f; }
            if (clip.pos[2] < binMinZ) { clip.pos[2] = binMinZ; clip.vel[2] = -clip.vel[2] * 0.4f; }

            // Collision with Bin Floor
            if (clip.pos[1] <= binFloorY) {
                clip.pos[1] = binFloorY;
                clip.vel[1] = -clip.vel[1] * 0.25f; // Inelastic clink
                clip.vel[0] *= 0.6f;
                clip.vel[2] *= 0.6f;
                clip.rotVel[0] *= 0.5f;
                clip.rotVel[1] *= 0.5f;
                clip.rotVel[2] *= 0.5f;

                // Settle condition
                float speedSq = clip.vel[0]*clip.vel[0] + clip.vel[1]*clip.vel[1] + clip.vel[2]*clip.vel[2];
                if (speedSq < 0.05f) {
                    clip.settled = true;
                    clip.vel[0] = clip.vel[1] = clip.vel[2] = 0.0f;
                }
            }

            // Sync with GPU Instance Buffer
            UpdateInstanceTransform(i, clip);
        }
    }

    size_t GetActiveCount() const { return m_physicsClips.size(); }
    const InstanceData* GetInstanceBufferData() const { return m_gpuInstances.data(); }

private:
    void UpdateInstanceTransform(size_t index, const PhysicalClip& clip) {
        auto& inst = m_gpuInstances[index];
        // Build translation matrix
        inst.worldMatrix.m[12] = clip.pos[0];
        inst.worldMatrix.m[13] = clip.pos[1];
        inst.worldMatrix.m[14] = clip.pos[2];
    }

    size_t m_maxCapacity;
    std::vector<PhysicalClip> m_physicsClips;
    std::vector<InstanceData> m_gpuInstances;
    std::mt19937 m_rng;
};

} // namespace OmniEngine
