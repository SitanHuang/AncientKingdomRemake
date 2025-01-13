
async function api_place_capital(gs, pt) {
  const [civ, gov] = gamestate_current_civ_gov(gs);
  const tile = map_at(gs.map, pt)

  if (!gov_is_central(gov)) {
    await api_throw_fatal("Current government is not central and cannot place the capital.");
    return;
  }
  if (civ.spawned) {
    await api_throw_fatal("Civ is already spawned. Cannot place capital again.");
    return;
  }

  tile_reset_owner(gs, tile, civ.id);
  tile_reset_controller(gs, tile, civ.id);
  api_set_dirty_tile_and_neighbors(gs, pt);
}