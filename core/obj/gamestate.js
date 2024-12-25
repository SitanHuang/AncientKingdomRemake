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

    randState: true, // rand state; true = initialize
  }, override);

  hook_nonenumerable_ref(
    gamestate,
    "_rng",
    alea(gamestate.seed, { state: gamestate.randState })
  );

  return gamestate;
}
