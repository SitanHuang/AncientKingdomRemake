
// The ONLY API function that can return an entirely different gamestate object
async function api_begin(gamestate) {
  gamestate = gamestate_create(gamestate);

  // Normalize all objects
  for (const civID in gamestate.civs) {
    const civ = (gamestate.civs[civID] = civ_create(gamestate.civs[civID]));

    // Create central government if not created:
    civ_get_govs_list(civ);

    // Normalize govs
    for (const govID in civ.govs) {
      civ.govs[govID] = gov_create(civ.govs[govID]);
    }
  }

  if (!gamestate.currentOrders?.length)
    api_loop_repopulate_orders(gamestate);

  if (!Number.isInteger(gamestate.currentStamp))
    gamestate.currentStamp = gamestate.beginStamp;
  if (!(gamestate.turns >= 0))
    gamestate.turns = 0;

  // GUI tiles changed tracking
  hook_nonenumerable_ref(gamestate, "_changedTiles", []);

  return gamestate;
}

async function api_turn_prep_gov(gs) {
  const civ = gamestate_current_civ(gs);
  const gov = gamestate_current_gov(gs);

  // AI
  if (gov.isAI) {
    // TODO: AI think
    await api_turn_end_gov(gs);
  }
}

async function api_turn_end_gov(gs) {
  api_loop_increment_order(gs);

  if (gs.currentOrderInd >= gs.currentOrders.length) {
    await api_turn_end_round(gs);
  }
}

async function api_turn_end_round(gs) {
  // end round logics

  // end cycle
  if (gs.turns % gs.turnsPerProdCycle == 0) {
    await api_turn_end_cycle(gs)
  }

  api_loop_repopulate_orders(gs);
  api_loop_increment_date(gs);
}

async function api_turn_end_cycle(gs) {

}