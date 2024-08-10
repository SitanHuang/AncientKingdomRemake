function tile_create({ row, col }) {
  const tile = {
    _pop: 0, // TODO: change to cultures; for now this should not be accessed directly

    row: row,
    col: col,

    id: row + ',' + col,

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

    ter: KEY_TER_DEFAULT, // type
    terAux: {}, // terrain aux mods

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

function tile_id(tile) {
  return tile.id;
}

function tile_terrainMod(tile) {
  return terrain_modObj(tile.ter);
}