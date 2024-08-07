(async function () {
  // const log = Logger.get("gui.state.startMenu");

  await gui_state_register("startMenu", {
    async init() {
      const $menu = gui_get$Template('template-start-menu').clone();

      $uiLayer.append($menu);
    },
    async cleanup() {
      $uiLayer.html('');
    },

    async onMapEditorClick() {
      gui_state_switch("mapEditor");
    }
  });
})();