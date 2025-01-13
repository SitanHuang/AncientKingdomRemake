function tilecache_initialize(gs) {
  // Hook tilecaches to civ & gov objects
  for (const civID in gs.civs) {
    const civ = gs.civs[civID];;

    delete civ.tile_cache;
    hook_nonenumerable_ref(civ, "_ownedtiles", tilecache_create());
    hook_nonenumerable_ref(civ, "_controlledtiles", tilecache_create());

    for (const govID in civ.govs) {
      const gov = civ.govs[govID];

      delete gov._tilecache;
      hook_nonenumerable_ref(gov, "_tiles", tilecache_create());
    }
  }

  // Assign owners
  for (let i = 0; i < gs.map.tiles.length; i++) {
    for (let j = 0; j < gs.map.tiles[0].length; j++) {
      const tile = gs.map.tiles[i][j];
      if (tile) {
        tile.owner && tilecache_add(tile_get_owner(gs, tile)._ownedtiles, tile_id_from_pt(i, j));
        tile.controller && tilecache_add(tile_get_controller(gs, tile)._controlledtiles, tile_id_from_pt(i, j));
        tile.gov && tilecache_add(tile_get_gov(gs, tile)._tiles, tile_id_from_pt(i, j));
      }
    }
  }
}

function tilecache_create() {
  // Benchmark verified; Set > MAP for most except slightly slower on has
  // Iteration almost 4x
  return new Set();
}

function tilecache_add(obj, id) {
  obj.add(id);
}
function tilecache_delete(obj, id) {
  obj.delete(id);
}
function tilecache_has(obj, id) {
  obj.has(id);
}
function tilecache_iterator(obj) {
  return obj;
}