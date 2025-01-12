function gov_create(override) {
  const gov = {
    civ: '', // civID
    id: uuidv4(), // "c" = central gov

    name: 'Gov',

    permissions: {},
    policies: {},

    isAI: false,

    tab: tab_create()
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