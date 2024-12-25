const TERRAIN_MOD_OBJS = {
  [KEY_TER_DEFAULT]: {
    name: 'Default',
    pop: 1, // pop growth
    econ: 1, // econ factor
    upkeep: 1, // unit consumption
    defence: 1, // unit defence bonus
    speed: 1, // unit movement factor
    attrition: 0.97, // production transfer efficiency out of tile
  },
  [KEY_TER_PLAIN]: {
    name: 'Plain',
    pop: 1,
    econ: 1,
    upkeep: 1,
    defence: 1,
    speed: 1,
    attrition: 0.97,
  },
  [KEY_TER_RIVER]: {
    name: 'River',
    _river: true,
    pop: 0.8,
    econ: 2,
    upkeep: 1,
    defence: 1.5,
    speed: 2,
    attrition: 0.99,
  },
  [KEY_TER_STEPPE]: {
    name: 'Steppe',
    pop: 0.3,
    econ: 1.2,
    upkeep: 1,
    defence: 0.8,
    speed: 1.2,
    attrition: 0.96,
  },
  [KEY_TER_DESERT]: {
    name: 'Desert',
    pop: 0.1,
    econ: 0.4,
    upkeep: 2,
    defence: 1.2,
    speed: 0.8,
    attrition: 0.92,
  },
  [KEY_TER_HILL]: {
    name: 'Hill',
    pop: 0.7,
    econ: 0.8,
    upkeep: 1.2,
    defence: 3,
    speed: 0.3,
    attrition: 0.95,
  },
  [KEY_TER_MOUNTAIN]: {
    name: 'Mountain',
    pop: 0.3,
    econ: 0.5,
    upkeep: 1.8,
    defence: 3,
    speed: 0.3,
    attrition: 0.93,
  },
  [KEY_TER_MOUNTAIN2]: {
    name: 'Mountain (Extreme)',
    pop: 0.1,
    econ: 0.3,
    upkeep: 2,
    defence: 3,
    speed: 0.1,
    attrition: 0.85,
  },
};

function terrain_modObj(key) {
  return TERRAIN_MOD_OBJS[key];
}

async function terrain_recalc_soil(map, {
  depth=12,
  samplePerc=0.1,
  climateMatrix=[[1]],
  progressFunc
}={}) {
  Logger.get("core.obj.map.terrain.terrain_recalc_soil").time("terrain_recalc_soil");

  const river = (pt) => {
    let count = 0;

    map_instant_neighbors(map, pt, (tile2) => {
      count += tile2.ter == KEY_TER_PLAIN || tile2.ter == KEY_TER_RIVER ?
        1 : (tile_terrainMod(tile2).pop);
    });

    return 1.5 * Math.min(1, (count / 4) ** 4);
  };

  const stat = await _terrain_gen_auxObj(map, {
    resultKey: 'soil',

    depth,
    power: 9,
    root: 2,
    scale: 1,
    constant: 0.1884,
    min: 0.05,

    samplePerc,
    climateMatrix,

    progressFunc,

    selfFunc(ter, { pt }) {
      return ter._river ? river(pt) : ter.pop;
    },
    func(ter, { pt }) {
      if (ter._river)
        return river(pt);

      const val = (ter.pop - 0.75);

      return val < 0 ? Math.min(-0.3, val) : (val + 1.5) * Math.min(1, ter.speed);
    },

    maxFunc(ter) {
      return ter._river ? 1 : ((ter.pop + 0.05) * 0.9
        + ter.speed * 0.05)
        * (ter.attrition ** 2);
    }
  });

  map.__terAuxPopStat = stat;

  // So far just the soil needs to be calculated
  map._terAuxUpToDate = true;

  Logger.get("core.obj.map.terrain.terrain_recalc_soil").timeEnd("terrain_recalc_soil");

  return stat;
}

async function _terrain_gen_auxObj(map, {
  resultKey,
  selfFunc,
  func,
  maxFunc,
  depth,
  power,
  root,
  scale,
  constant,
  min,
  samplePerc,
  climateMatrix,

  progressFunc,
}) {
  const rng = map_gen_rng();
  const stat = {
    max: 0,
    sum: 0,
    avg: 0,
    count: 0,
  };

  function getClimateValue(row, col) {
    // If no matrix or empty, default to 1 (neutral multiplier).
    if (!climateMatrix || !climateMatrix.length || !climateMatrix[0].length) {
      return 1;
    }
    const CH = climateMatrix.length;
    const CW = climateMatrix[0].length;

    const rowF = (row / (map.height - 1)) * (CH - 1);
    const colF = (col / (map.width - 1)) * (CW - 1);

    const row1 = Math.floor(rowF);
    const row2 = Math.min(row1 + 1, CH - 1);
    const col1 = Math.floor(colF);
    const col2 = Math.min(col1 + 1, CW - 1);

    const rFrac = rowF - row1;
    const cFrac = colF - col1;

    const v11 = climateMatrix[row1][col1];
    const v12 = climateMatrix[row1][col2];
    const v21 = climateMatrix[row2][col1];
    const v22 = climateMatrix[row2][col2];

    // Bilinear interpolation
    const blended = v11 * (1 - rFrac) * (1 - cFrac)
                  + v12 * (1 - rFrac) * cFrac
                  + v21 * rFrac       * (1 - cFrac)
                  + v22 * rFrac       * cFrac;

    return blended;
  }

  for (let r = 0; r < map.height; r++) {
    for (let c = 0; c < map.width; c++) {
      const tile = map_at(map, [r, c]);
      if (!tile)
        continue;

      let divisor = 0;
      let sumOfSquares = 0;

      map_instant_neighbors_recursive(map, tile.pt, depth, (tile2) => {
        const dist = tile_dist(tile.pt, tile2.pt);
        const ter2 = tile_terrainMod(tile2);
        const raw = Math.min(
          dist > 0 ? func(ter2, tile2) : selfFunc(ter2, tile2),
          maxFunc(ter2, tile2)
        );

        const val = Math.abs((raw ** power) / (dist + 1));
        sumOfSquares += raw < 0 ? -val : val;

        divisor += 1 / (dist + 1);
      }, true, undefined, (_, currentDepth) => {
        return rng() < (samplePerc * ((depth / currentDepth) ** 2));
      });

      let mod = (sumOfSquares / divisor);

      if (mod < 0)
        mod = -1 * ((-mod) ** (1 / root));
      else
        mod = mod ** (1 / root);

      mod *= getClimateValue(r, c);

      mod = mod * scale + constant;
      mod = Math.max(min, mod);

      tile.terAux[resultKey] = mod;

      stat.count++;
      stat.max = Math.max(stat.max, mod);
      stat.sum += mod;
    }

    await progressFunc(r / map.height);
  }

  stat.avg = stat.sum / stat.count;
  return stat;
}
