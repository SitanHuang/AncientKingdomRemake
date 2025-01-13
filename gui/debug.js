if (GLOBAL_DEBUG_FLAG) {
  $.getJSON("mods/test/gamestate.json").done(async function (scenarioObj) {
    await gui_state_switch("gameController", { scenarioObj });
    // GameControllerSingleton.renderer.selectableMask = map_mask_create(scenarioObj.map, true);
    // GameControllerSingleton.renderer.beginSelection({
    //   onTileSelect: async () => true
    // });
  });
}