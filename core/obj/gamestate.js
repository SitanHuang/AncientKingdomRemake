function gamestate_create(override={}) {
  override.seed = override.seed || Math.random().toString();

  const gamestate = Object.assign({
    map: undefined,
    cultures: {},
    civs: {},

    randState: true, // rand state
  }, override);

  gamestate_hook_nonenumerable_ref(
    gamestate,
    "_rand",
    alea('map_gen_rng', { state: gamestate.randState })
  );

  return gamestate;
}

/**
 * Allows hooking a dynamic, runtime reference while still keeping a gamestate
 * JSON-compliant
 */
function gamestate_hook_nonenumerable_ref(gamestate, key, ref) {
  Object.defineProperty(gamestate, key, {
    enumerable: false,
    value: ref
  });
}