function gov_create(override) {
  const gov = {
    civ: '', // civID
    id: uuidv4(), // "c" = central gov

    name: 'Gov',

    permissions: {},
    policies: {},

    isAI: false,

    tab: tab_create(override?.tab),
    stat: stat_create(override?.stat),

    // TODO: central gov depends on buildings prob, not hard location
  };

  return Object.assign(gov, override);
}

function gov_create_central(civ) {
  const gov = gov_create({
    civ: civ.id,
    id: "c",
    name: "Central Government"
  });

  return gov;
}

function gov_is_central(gov) {
  return gov.id == "c";
}