(async function () {
  const log = Logger.get("gui.state.mapEditor");

  let renderer;

  let $mapEditor;

  let mapObj; // the actual map we're working with

  function createMapObj() {
    mapObj = map_create({
      width: parseInt($mapEditor.find('input[name="width"]').val()),
      height: parseInt($mapEditor.find('input[name="height"]').val()),
    });
  }

  await gui_state_register("mapEditor", {
    async init() {
      $mapEditor = gui_get$Template('template-map-editor').clone();

      let $form = $mapEditor.find('.left-pane form');
      let $submit = $form.find('button');

      $form.find('input').on('input', function(e) {
        $submit.attr('disabled', !$form[0].checkValidity());
      });

      $form.on('submit', function(e) {
        e.preventDefault();

        if (!$form[0].checkValidity())
          return false;

        createMapObj();
        gui_state_dispatchEvent("beginCanvas");
      });

      $uiLayer.append($mapEditor);
    },

    async beginCanvas() {
      const state = await gui_state_getStore();

      if (state.renderer)
        await state.renderer.cleanup();

      state.renderer =
        window.renderer = renderer = new MapEditorRenderer($canvasContainer[0]);

      await renderer.init();
      await renderer.begin({ mapObj });
    },

    async cleanup() {
      await renderer.cleanup();
      $uiLayer.html('');
    },

    async onMapEditorClick() {
    }
  });
})();