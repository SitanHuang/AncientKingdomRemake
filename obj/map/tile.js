function tile_create() {
  const tile = {
    pop: 0,
    // pop: {
    //   // [cultureID]: pop
    // },

    // popOpinion: {
    //   // [cultureID]: pop
    // },

    /**
     * Tracks relatively how much a culture relates to
     * this tile.
     *
     * For each round, a culture accumulates weight by:
     *  - current pop
     *  - current production
     */
    popHist: {
      // [cultureID]: cml
    },

    // res: {
    //   // [resourceEnum]: amount
    // },

    ter: SYM_TER_DEFAULT, // type
    terMods: {}, // terrain mods

    owner: 0, // playerID (0 = none)
    controller: 0, // playerID (0 = none)

    prov: 0, // provinceID, 0 = central
    part: 0, // partID

    // buildings:
    slots: {
      // [buildingID]: HP
    },
  };

  return tile;
}
