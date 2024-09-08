function civ_create(override) {
  const civ = {
    name: '',
    id: uuidv4(),

    hist: {
      // TODO: non MVP feature to be implemented
      pop: {
        //     // [civID]: pop
      },
      prod: {},
      capitals: [], // pts of past capitals
    },

    culture: '', // cultureID
    parts: [],
    govs: {},

    color: 0x000000,

    deceased: true, // whether civ is still active
    spawned: false, // whether civ was ever spawned in the past / currently
  };

  return Object.assign(civ, override);
}