function tile_create(override) {
  const { row, col } = override;

  const tile = {
    pt: [row, col],

    row: row,
    col: col,

    id: tile_id_from_pt(row, col),

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

    gov: 0, // govID
    part: 0, // partID

    // buildings:
    slots: {
      // [buildingID]: HP
    },
  };

  return Object.assign(tile, override);
}

/**
 * This function does NOT participate in standard dirty obj tracking because
 * it's used only in the map editor.
 */
function tile_river_calc_graphic_type(map, tile, propagate=true, dirtyFunc) {
  if (tile.ter != KEY_TER_RIVER) {
    delete tile.terAux.riverGType;
    return;
  }

  tile.terAux.riverGType = 0b0000; // top, right, bottom, left

  if (dirtyFunc)
    dirtyFunc(tile);

  map_instant_neighbors(map, tile.pt, (tile2) => {
    if (tile2.ter != KEY_TER_RIVER)
      return;

    if (propagate)
      tile_river_calc_graphic_type(map, tile2, false, dirtyFunc);

    tile.terAux.riverGType = tile.terAux.riverGType | (
      (tile2.row < tile.row && 0b1000) ||
      (tile2.row > tile.row && 0b0010) ||
      (tile2.col < tile.col && 0b0001) ||
      (tile2.col > tile.col && 0b0100)
    );
  });
}

function tile_id(tile) {
  return tile.id;
}

function tile_id_from_pt(row, col) {
  return row * MAP_MAX_LENGTH + col;
}

function tile_get_owner(gs, tile) {
  return gs?.civs[tile?.owner];
}
function tile_get_controller(gs, tile) {
  return gs?.civs[tile?.controller];
}
function tile_reset_owner(gs, tile, newOwner) {
  // if (tile.owner == newOwner)
  //   return;

  // if (tile.owner !== 0) {
  //   tile_get_owner(gs, tile).stat.tilesOwned--;
  // }

  tile.owner = newOwner;
  // tile_get_owner(gs, tile).stat.tilesOwned++;
}
function tile_reset_controller(gs, tile, newController) {
  // if (tile.controller == newController)
  //   return;

  // if (tile.controller !== 0) {
  //   tile_get_controller(gs, tile).stat.tilesOwned--;
  // }

  tile.controller = newController;
  // tile_get_controller(gs, tile).stat.tilesOwned++;
}
function tile_reset_gov(gs, tile, newGov) {
  // if (tile.gov == newController)
  //   return;

  // if (tile.gov !== 0) {
  //   tile_get_gov(gs, tile).stat.tilesOwned--;
  // }

  tile.gov = newController;
  // tile_get_gov(gs, tile).stat.tilesOwned++;
}

function tile_pt_from_id(id) {
  const row = Math.floor(id / MAP_MAX_LENGTH);
  const col = id % MAP_MAX_LENGTH;
  return [ row, col ];
}

function tile_dist(pt1, pt2) {
  return Math.sqrt((pt1[0] - pt2[0]) ** 2 + (pt1[1] - pt2[1]) ** 2);
}

function tile_terrainMod(tile) {
  return terrain_modObj(tile.ter);
}

function tile_is_uncivilized(tile) {
  return tile?.owner === 0 && tile?.controller === 0;
}