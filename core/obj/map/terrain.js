const TERRAIN_MOD_OBJS = {
  [KEY_TER_DEFAULT]: {
    pop: 1, // pop growth
    econ: 1, // econ factor
    upkeep: 1, // unit consumption
    defence: 1, // unit defence bonus
    speed: 1, // unit movement factor
    attrition: 0.97, // production transfer efficiency out of tile
  },
  [KEY_TER_PLAIN]: {
    pop: 1,
    econ: 1,
    upkeep: 1,
    defence: 1,
    speed: 1,
    attrition: 0.97,
  },
  [KEY_TER_RIVER]: {
    _river: true,
    pop: 0.8,
    econ: 2,
    upkeep: 1,
    defence: 1.5,
    speed: 2,
    attrition: 0.99,
  },
  [KEY_TER_STEPPE]: {
    pop: 0.2,
    econ: 1.2,
    upkeep: 1,
    defence: 0.8,
    speed: 1.2,
    attrition: 0.96,
  },
  [KEY_TER_DESERT]: {
    pop: 0.1,
    econ: 0.4,
    upkeep: 2,
    defence: 1.2,
    speed: 0.8,
    attrition: 0.92,
  },
  [KEY_TER_HILL]: {
    pop: 0.7,
    econ: 0.8,
    upkeep: 1.2,
    defence: 3,
    speed: 0.3,
    attrition: 0.95,
  },
  [KEY_TER_MOUNTAIN]: {
    pop: 0.3,
    econ: 0.5,
    upkeep: 1.8,
    defence: 3,
    speed: 0.3,
    attrition: 0.93,
  },
  [KEY_TER_MOUNTAIN2]: {
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

function terrain_recalc_soil(map) {
  Logger.get("core.obj.map.terrain.terrain_recalc_soil").time("terrain_recalc_soil");

  _terrain_gen_auxObj(map, {
    resultKey: 'soil',

    depth: 10,
    power: 11,
    root: 2,
    scale: 1.4,
    constant: 0.1,
    min: 0.05,

    samplePerc: 0.04,

    selfFunc(ter) {
      return ter._river ? 1.2 : ter.pop;
    },
    func(ter) {
      if (ter._river)
        return 2;

      const val = (ter.pop - 0.75);

      return val < 0 ? Math.min(-0.3, val) : (val + 1.5) * Math.min(1, ter.speed);
    },

    maxFunc(ter) {
      return ((ter.pop + 0.05) * 0.9
        + ter.speed * 0.05)
        * (ter.attrition ** 2);
    }
  });

  Logger.get("core.obj.map.terrain.terrain_recalc_soil").timeEnd("terrain_recalc_soil");
}

function _terrain_gen_auxObj(map, {
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
}) {
  const rng = map_gen_rng();

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

      mod = mod * scale + constant;
      mod = Math.max(min, mod);

      tile.terAux[resultKey] = mod;
    }
  }
}