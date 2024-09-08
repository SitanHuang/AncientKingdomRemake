function gov_create(override) {
  const gov = {
    civID: '',
    id: uuidv4(), // 0 = central gov

    permissions: {},
    policies: {},
  };

  return Object.assign(gov, override);
}