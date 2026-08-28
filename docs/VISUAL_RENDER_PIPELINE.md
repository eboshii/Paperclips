# Visual Render Pipeline & Shader Specifications
# Objective: Paperclips (Universal Paperclips 3D)

---

## 1. Multi-Tier Camera Rig Architecture

The camera controller smoothly transitions through 5 spatial scales using logarithmic distance interpolation:

```csharp
// Conceptual Camera Controller
public class CosmicCameraController : MonoBehaviour
{
    [SerializeField] private Transform cameraTarget;
    [SerializeField] private float[] tierDistances = new float[] { 1.2f, 85f, 15000f, 500000f, 1e8f };
    [SerializeField] private int currentTier = 0;
    
    public void SetScaleTier(int tier)
    {
        currentTier = Mathf.Clamp(tier, 0, tierDistances.Length - 1);
        // Trigger smooth logarithmic interpolation and LOD layer shifts
    }
}
```

### 1.1 Spatial Tiers & LOD Switching

```
+-------------------------------------------------------------------------------+
| Tier 0: Machine Desk (0 to 10k)      -> High-poly PBR models, real-time lights|
| Tier 1: Factory Hall (10k to 100M)   -> GPU instanced conveyor lines, decals  |
| Tier 2: Continental / Orbit (100M+)  -> Spherical Earth mesh + custom shaders |
| Tier 3: Solar System (10^18+)        -> Scaled celestial bodies & Dyson rings |
| Tier 4: Galactic Cluster (10^54+)    -> Particle compute point-cloud universe |
+-------------------------------------------------------------------------------+
```

---

## 2. GPU Mesh Instancing for High-Volume Paperclips

To render up to $100,000$ active clips without CPU overhead:
* Use `Graphics.DrawMeshInstancedIndirect` (Unity) or `MultiMeshInstance3D` (Godot).
* Position, rotation, velocity, and lifetime data stored in a ComputeBuffer on the GPU.
* Simple vertex shader samples matrix buffer directly:

```hlsl
// HLSL Instancing Buffer Sample
struct InstanceData {
    float4x4 objectToWorld;
    float4 colorVariation;
};

StructuredBuffer<InstanceData> _InstanceBuffer;

v2f vert(appdata_custom v, uint instanceID : SV_InstanceID) {
    v2f o;
    float4x4 mat = _InstanceBuffer[instanceID].objectToWorld;
    float4 worldPos = mul(mat, v.vertex);
    o.pos = mul(UNITY_MATRIX_VP, worldPos);
    o.uv = v.uv;
    o.color = _InstanceBuffer[instanceID].colorVariation;
    return o;
}
```

---

## 3. Planetary "Paperclipification" Surface Shader

When viewing Earth in Tier 2/3, a procedural shader replaces organic ground textures with a metallic woven wire pattern driven by `_ConversionRatio (0.0 -> 1.0)`:

* **Vertex Displacement:** Subtle geometric tessellation creating rigid, faceted plateaus as soil is transformed into structured steel.
* **Albedo Blending:** Smooth interpolation between satellite texture (forests, blue ocean) and anisotropic chrome brushed metal.
* **Emissive Trenches:** Magma/energy conduits glow neon cyan/orange along Voronoi grid boundaries.
