(async function () {
  const log = Logger.get("gui.state.mapEditor");

  let renderer;

  let $mapEditor;
  let $controls;

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

      $controls = $mapEditor.find('div.controls');
      $controls.hide();

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

      $controls.show().find('button.insert-bg-btn')[0].onclick = () => {
        const imgURL = $controls.find('input[name="imgURL"]').val();
        const offsetX = parseFloat($controls.find('input[name="offsetX"]').val()) || 0;
        const offsetY = parseFloat($controls.find('input[name="offsetY"]').val()) || 0;
        const scale = parseFloat($controls.find('input[name="scale"]').val()) || 1;
        const alpha = parseFloat($controls.find('input[name="alpha"]').val()) || 0.00;

        gui_state_dispatchEvent("onInsertBGImg", { imgURL, offsetX, offsetY, scale, alpha });
      };
    },

    async cleanup() {
      await renderer.cleanup();
      $uiLayer.html('');
    },

    async onMapEditorClick() {
    },

    async onInsertBGImg({ imgURL, offsetX, offsetY, scale, alpha }) {
      renderer.cacheManager.setDirty("mapEditor", "bgImg");
      await renderer.cacheManager.getFreshObjOrReplaceAsync(async (orig) => {
        if (orig) {
          renderer.viewport.removeChild(orig);
          orig.destroy(true);
        }

        orig = PIXI.Sprite.from(await PIXI.Assets.load(imgURL));

        renderer.viewport.addChild(orig);

        orig.label = 'bgImg';
        orig.x = offsetX;
        orig.y = offsetY;
        orig.scale = scale;
        orig.alpha = alpha;
        orig.zIndex = 999999;
        orig.eventMode = 'none';

        return orig;
      }, "mapEditor", "bgImg");
    },
  });
})();