(async function () {
  // const log = Logger.get("gui.state.scenarioEditor");
  let $editorCon = $('<div></div>');

  let gsOverrides;

  function switchTemplate(newTemp) {
    let newCon = gui_get$Template(newTemp)
      .clone()
      .prependTo($uiLayer);
    let oldCon = $editorCon;
    $editorCon = newCon;
    return async () => {
      await gui_crossfade_elements(oldCon, newCon);
      oldCon.remove();
    };
  }

  await gui_state_register("scenarioEditor", {

    async init() {

    },
    async start() {
      // TODO: create new or load gamestateObj from file
      gsOverrides = { cultures: {}, civs: {} };
      await gui_state_dispatchEvent("editCultures");
    },
    async cleanup() {
      $uiLayer.html('');
    },

    async editCivs() {
      const execFade = switchTemplate('template-scenario-editor-civs');

      const gen_rows = () => {
        const $civs = $editorCon.find('.civs').html('');

        for (const civId in gsOverrides.civs) {
          const civ = gsOverrides.civs[civId];

          let html = `
          <div>
            <form class="row">
              <input type="hidden" name="id">
              <div class="col-8">
                <label>Civ Name</label>
                <input type="text" name="name" required>
              </div>
              <div class="col-4">
                <label>Color</label>
                <input type="color" name="color" required>
              </div>
              <div class="col-4">
                <label>Decreased</label>
                <input type="checkbox" name="deceased">
              </div>
              <div class="col-4">
                <label>Spawned</label>
                <input type="checkbox" name="spawned">
              </div>
              <div class="col-4">
                <label>Culture</label>
                <select name="culture" data-dataset="cultures"></select>
              </div>
            </form>
            <divider></divider>
          </div>
          `;

          const $civ = $(html);
          $civs.append($civ);

          gui_forms_map_to_obj($civ, civ, {
            datasets: {
              cultures: Object.values(gsOverrides.cultures).map(culture => [
                culture.name, culture.id
              ])
            }
          });
        }
      };

      gen_rows();

      $editorCon.find('.btn-add-civ')[0].onclick = () => {
        const civ = civ_create();
        gsOverrides.civs[civ.id] = civ;
        gen_rows();
      };
      await execFade();
    },

    async editCultures() {
      const execFade = switchTemplate('template-scenario-editor-cultures');

      const blankCulture = culture_create();

      const gen_rows = () => {
        const $cultures = $editorCon.find('.cultures').html('');

        for (const cultureId in gsOverrides.cultures) {
          const culture = gsOverrides.cultures[cultureId];

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
        gsOverrides.cultures[culture.id] = culture;
        gen_rows();
      };

      await execFade();
    },
  });
})();