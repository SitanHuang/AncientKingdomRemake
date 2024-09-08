function culture_create(override={}) {
  const preferredTers = {};

  for (const key in TERRAIN_MOD_OBJS) {
    preferredTers[key] = 1;
  }

  const culture = {
    name: '',
    id: uuidv4(),

    hist: {
      // TODO: non MVP feature to be implemented
      pop: {
    //     // [civID]: pop
      },
      prod: {},
    },

    mods: {
      pop: 1,
      prod: 1,
      inclusiveness: 1, // ability to assimulate other cultures
      expansiveness: 1, // desire to expand territory
      plurality: 1, // ability for multiple states of one culture to coexist
      warfare: 1,
      research: 1,
    },

    preferredTers: {
      // [terrain]: weight from 0-1, summing to 1
      ...preferredTers
    },

    color: 0x000000,
  };

  return Object.assign(culture, override);
}