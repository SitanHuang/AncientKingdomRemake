const TERRAIN_MOD_OBJS = {
  [SYM_TER_DEFAULT]: {
    pop: 1,
    econ: 1,
    upkeep: 1,
    defence: 1,
    speed: 1
  },
  [SYM_TER_PLAIN]: {
    pop: 1,
    econ: 1,
    upkeep: 1,
    defence: 1,
    speed: 1
  },
  [SYM_TER_RIVER]: {
    pop: 1.5,
    econ: 2,
    upkeep: 1,
    defence: 1.5,
    speed: 2
  },
  [SYM_TER_STEPPE]: {
    pop: 0.3,
    econ: 1.2,
    upkeep: 1,
    defence: 0.8,
    speed: 1.2
  },
  [SYM_TER_DESERT]: {
    pop: 0.1,
    econ: 0.4,
    upkeep: 1,
    defence: 1.2,
    speed: 0.6
  },
  [SYM_TER_MOUNTAIN]: {
    pop: 0.2,
    econ: 0.5,
    upkeep: 1,
    defence: 3,
    speed: 0.3
  },
};

function terrain_modObj(key) {
  return TERRAIN_MOD_OBJS[key];
}