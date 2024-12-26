(async function () {
  let $menu;
  let $loadMapBtn;
  let $loadPresetBtn;

  let scenarioObj;
  let mapObj;

  await gui_state_register("gameLoader", {
    async init() {
      $menu = gui_get$Template('template-game-loader').clone();
      $loadMapBtn = $menu.find('.btn-load-map').attr("data-status", "normal");
      $loadPresetBtn = $menu.find('.btn-load-preset').attr("data-status", "normal");

      $loadMapBtn[0].onclick = () => gui_state_dispatchEvent("loadMap");
      $loadPresetBtn[0].onclick = () => gui_state_dispatchEvent("loadScenario");

      scenarioObj = mapObj = null;

      $menu.find(".btn-load-preset");

      $uiLayer.append($menu);
    },

    async cleanup() {
      await gui_fade_away_element($menu);
      $uiLayer.html('');
    },

    async loadMap({ mapData=null }) {
      mapObj = mapData || (await fs_prompt_load_obj()) || null;

      if (!(mapObj?.width > 1 && mapObj?.height > 1 && Array.isArray(mapObj.tiles))) {
        await gui_dialog_alert("Error: The map data is invalid.");
        $loadMapBtn.attr("data-status", "error");
        return;
      }

      $loadMapBtn.attr("data-status", "success");
    },

    async loadScenario() {
      scenarioObj = (await fs_prompt_load_obj()) || null;

      let success = true;

      fail = () => { success = false; $loadPresetBtn.attr("data-status", "error") };

      if (!Object.keys(scenarioObj?.civs || {}).length) {
        await gui_dialog_alert("Error: The scenario file does not contain any civilizations.", { status: "error" });
        fail();
      }
      if (!Object.keys(scenarioObj?.cultures || {}).length) {
        await gui_dialog_alert("Error: The scenario file does not contain any cultures.", { status: "error" });
        fail();
      }

      if (!success)
        return;

      if (scenarioObj.map) {
        await gui_dialog_alert("The scenario file contains a map; this may be a save game instead. Map file is now automatically loaded.");
        await gui_state_dispatchEvent("loadMap", { mapData: scenarioObj.map });
      }

      $loadPresetBtn.attr("data-status", "success");
    },

    async startGame() {
      if ($loadMapBtn.attr("data-status") != "success" || $loadPresetBtn.attr("data-status") != "success") {
        await gui_dialog_alert("Please load both map and scenario files to create a new game.", { status: "error" });
        return;
      }
      await gui_state_switch('gameController');
    },
  });
})();