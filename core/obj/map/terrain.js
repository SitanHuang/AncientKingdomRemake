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
    pop: 1.5,
    econ: 2,
    upkeep: 1,
    defence: 1.5,
    speed: 2,
    attrition: 0.99,
  },
  [KEY_TER_STEPPE]: {
    pop: 0.3,
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
    speed: 0.6,
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
    pop: 0.2,
    econ: 0.5,
    upkeep: 1.8,
    defence: 3,
    speed: 0.3,
    attrition: 0.93,
  },
};

function terrain_modObj(key) {
  return TERRAIN_MOD_OBJS[key];
}