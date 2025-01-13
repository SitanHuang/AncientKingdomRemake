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
    spawned: false, // whether capital placement is disabled
  };

  return Object.assign(civ, override);
}

function civ_central_gov(civ) {
  return civ.govs.c;
}

function civ_get_govs_list(civ) {
  const govs = Object.values(civ.govs);

  if (!govs.length) {
    civ_set_gov(civ, gov_create_central(civ));
    return civ_get_govs_list(civ);
  }

  return govs;
}

function civ_set_gov(civ, gov) {
  civ.govs[gov.id] = gov;
}