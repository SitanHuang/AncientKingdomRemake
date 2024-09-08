(async function () {
  // const log = Logger.get("gui.state.startMenu");

  let $menu;

  await gui_state_register("startMenu", {
    async init() {
      $menu = gui_get$Template('template-start-menu').clone();

      $uiLayer.append($menu);
    },
    async cleanup() {
      await gui_fade_away_element($menu);
      $uiLayer.html('');
    },

    async onMapEditorClick() {
      gui_state_switch("mapEditor");
    }
  });
})();