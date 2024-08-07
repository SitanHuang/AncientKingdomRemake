(async function () {
  const log = Logger.get("gui.state.mapEditor");

  await gui_state_register("mapEditor", {
    async init() {
      log.info('Hi')
    },
    async cleanup() {
      $uiLayer.html('');
    },

    async onMapEditorClick() {
    }
  });
})();