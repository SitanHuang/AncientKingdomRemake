
// The ONLY API function that can return an entirely different gamestate object
async function api_begin(gamestate) {
  gamestate = gamestate_create(gamestate);

  // Normalize all objects
  for (const civID in gamestate.civs) {
    gamestate.civs[civID] = civ_create(gamestate.civs[civID]);
    // Create central government if not created:
    civ_get_govs_list(gamestate.civs[civID]);
  }

  if (!gamestate.currentOrders?.length)
    api_loop_repopulate_orders(gamestate);

  if (!Number.isInteger(gamestate.currentStamp))
    gamestate.currentStamp = gamestate.beginStamp;
  if (!(gamestate.turns >= 0))
    gamestate.turns = 0;

  return gamestate;
}

async function api_turn_prep_gov(gs) {

}

async function api_turn_end_gov(gs) {
  let response = api_response_obj();

  api_loop_increment_order(gs);

  if (gs.currentOrderInd >= gs.currentOrders.length) {
    response = api_response_obj_merge(await api_turn_end_round(gs), response);
  }

  return response;
}

async function api_turn_end_round(gs) {
  let response = api_response_obj();

  // end round logics

  // end cycle
  if (gs.turns % gs.turnsPerProdCycle == 0) {
    response = api_response_obj_merge(await api_turn_end_cycle(gs), response);
  }

  api_loop_repopulate_orders(gs);
  api_loop_increment_date(gs);

  return response;
}

async function api_turn_end_cycle(gs) {
  let response = api_response_obj();

  return response;
}