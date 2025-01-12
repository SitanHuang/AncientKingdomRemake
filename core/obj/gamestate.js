function gamestate_create(override={}) {
  override.seed = override.seed || Math.random().toString();

  const gamestate = Object.assign({
    map: undefined,
    cultures: {},
    civs: {},

    name: 'Scenario',

    beginStamp: -62167132800000, // 0000-01-02
    currentStamp: null,

    turns: 0,
    weeksPerTurn: 1,

    turnsPerProdCycle: 12,

    currentOrders: [],
    currentOrderInd: 0,
    currentCiv: null,
    currentGov: null,

    ordersOutOfDate: false, // true if currentOrders need to be refreshed

    randState: true, // rand state; true = initialize
  }, override);

  // const realRand = alea(gamestate.seed, { state: gamestate.randState });

  hook_nonenumerable_ref(
    gamestate,
    "_rng",
    alea(gamestate.seed, { state: gamestate.randState })
    // () => {
    //   // 64 bit realRand.double() -> 145 ms
    //   // 32 bit realRand() -> 105 ms
    //   // native -> 17 ms

    //   // 32 bit without state() -> 50 ms
    //   // direct alea() -> 37 ms
    //   const result = realRand(); // 32 bit
    //   // gamestate.randState = realRand.state();
    //   return result;
    // }
  );

  return gamestate;
}

function gamestate_save_rand_state(gamestate) {
  gamestate.randState = gamestate._rng.state();
}

function gamestate_current_civ(gs) {
  return gs.civs[gs.currentCiv];
}
function gamestate_current_gov(gs) {
  return gamestate_current_civ(gs).govs[gs.currentGov];
}