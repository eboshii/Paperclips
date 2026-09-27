/**
 * spatialGrid.js - 8x8 Spatial Synergy Factory Floor Grid
 * Evaluates conveyor throughput lines, thermal cooling adjacency, and harmonic symmetry.
 */

class SpatialGridEngine {
    constructor(width = 8, height = 8) {
        this.width = width;
        this.height = height;
        this.grid = Array(height).fill(null).map(() => Array(width).fill(null));
        this.selectedTile = null;
    }

    setTile(x, y, tileType) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = tileType;
        }
    }

    getTile(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.grid[y][x];
        }
        return null;
    }

    clearTile(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = null;
        }
    }

    autoPlace(tileType, count) {
        // Spiral / harmonic symmetrical placement
        for (let r = 0; r < Math.max(this.width, this.height); ++r) {
            for (let dy = -r; dy <= r; ++dy) {
                for (let dx = -r; dx <= r; ++dx) {
                    const cx = Math.floor(this.width / 2) + dx;
                    const cy = Math.floor(this.height / 2) + dy;
                    if (cx >= 0 && cx < this.width && cy >= 0 && cy < this.height) {
                        if (this.grid[cy][cx] === null) {
                            this.grid[cy][cx] = tileType;
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    evaluateSynergies() {
        let linearFeedBonuses = 0;
        let coolingBonuses = 0;
        let symmetricMatches = 0;
        let totalPlaced = 0;

        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const cell = this.grid[y][x];
                if (!cell) continue;
                totalPlaced++;

                // 1. Conveyor Adjacency: Extruder next to Stamper
                const neighbors = [
                    this.getTile(x + 1, y),
                    this.getTile(x - 1, y),
                    this.getTile(x, y + 1),
                    this.getTile(x, y - 1)
                ];

                if (cell === 'WireExtruder') {
                    if (neighbors.includes('HydraulicStamper')) {
                        linearFeedBonuses += 15;
                    }
                }

                // 2. Cooling Adjacency: Sinterer next to Cooler
                if (cell === 'LaserSinterer') {
                    const coolerCount = neighbors.filter(n => n === 'CoolingTower').length;
                    coolingBonuses += coolerCount * 25;
                }

                // 3. Rotational symmetry check (mirrored across X axis)
                const mirrorX = this.width - 1 - x;
                if (this.grid[y][mirrorX] === cell) {
                    symmetricMatches++;
                }
            }
        }

        const maxCells = this.width * this.height;
        const symmetryScorePercent = totalPlaced > 0 ? Math.min(100, Math.round((symmetricMatches / totalPlaced) * 100)) : 0;
        const linearBonusPercent = Math.min(100, linearFeedBonuses);
        const coolingBonusPercent = Math.min(100, coolingBonuses);

        // Calculate total layout multiplier
        const totalMult = 1.0 + (linearBonusPercent * 0.005) + (coolingBonusPercent * 0.005) + (symmetryScorePercent * 0.003);

        return {
            linearBonusPercent: linearBonusPercent,
            coolingBonusPercent: coolingBonusPercent,
            symmetryScorePercent: symmetryScorePercent,
            totalMultiplier: totalMult,
            totalPlaced: totalPlaced
        };
    }
}

if (typeof window !== 'undefined') {
    window.SpatialGridEngine = SpatialGridEngine;
}
