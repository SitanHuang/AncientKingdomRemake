(async function () {
  // const log = Logger.get("gui.state.scenarioEditor");
  let $editorCon = $('<div></div>');

  async function switchTemplate(newTemp) {
    let newCon = gui_get$Template(newTemp)
      .clone()
      .appendTo($uiLayer);
    await gui_crossfade_elements($editorCon, newCon);
    $editorCon.remove();
    $editorCon = newCon;
  }

  await gui_state_register("scenarioEditor", {

    async init() {

    },
    async start() {
      // TODO: create new or load gamestateObj from file
      await gui_state_dispatchEvent("editCultures", { cultures: {} });
    },
    async cleanup() {
      $uiLayer.html('');
    },

    async editCultures(gamestateOverride = { cultures: {} }) {
      window.gamestateOverride = gamestateOverride
      await switchTemplate('template-scenario-editor-cultures');

      const blankCulture = culture_create();

      const gen_rows = () => {
        const $cultures = $editorCon.find('.cultures').html('');

        for (const cultureId in gamestateOverride.cultures) {
          const culture = gamestateOverride.cultures[cultureId];

          let html = `
          <div>
            <form class="row">
              <input type="hidden" name="id">
              <div class="col-8">
                <label>Culture Name</label>
                <input type="text" name="name" required>
              </div>
              <div class="col-4">
                <label>Color</label>
                <input type="color" name="color" required>
              </div>`;

          for (const mod in blankCulture.mods) {
            html += `
              <div class="col-4">
                <label>Mod: ${mod}</label>
                <input type="range" name="mods:${mod}" required
                  min="0" max="2" step="any">
              </div>
            `;
          }
          for (const ter in blankCulture.preferredTers) {
            const terrain = TERRAIN_MOD_OBJS[ter];
            html += `
              <div class="col-4">
                <label>Preferred Ter: ${terrain.name}</label>
                <input type="range" name="preferredTers:${ter}" required
                  min="0" max="2" step="any">
              </div>
            `;
          }

          html += `
            </form>
            <divider></divider>
          </div>
          `;

          const $culture = $(html);
          $cultures.append($culture);

          gui_forms_map_to_obj($culture, culture);
        }
      };

      gen_rows();

      $editorCon.find('.btn-add-culture')[0].onclick = () => {
        const culture = culture_create();
        gamestateOverride.cultures[culture.id] = culture;
        gen_rows();
      };
    },
  });
})();