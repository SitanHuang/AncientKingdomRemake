if (GLOBAL_DEBUG_FLAG) {
  $.getJSON("mods/test/gamestate.json").done(function (scenarioObj) {
    gui_state_switch("gameController", { scenarioObj })
  });
}