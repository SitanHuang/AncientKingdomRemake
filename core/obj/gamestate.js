function gamestate_create(override={}) {
  override.seed = override.seed || Math.random().toString();

  const gamestate = Object.assign({
    map: undefined,
    cultures: {},
    civs: {},

    beginStamp: 0,
    currentStamp: 0,

    turns: 0,
    weeksPerTurn: 1,

    turnsPerProdCycle: 12,

    currentOrders: [],
    currentPlayer: null,
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
