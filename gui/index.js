
const $canvasContainer = $('canvas-container');
const $uiLayer = $('ui-layer');
const $templates = $('templates');

function gui_getTemplate(id) {
  return $templates[0].getElementsByClassName(id)[0];
}
function gui_get$Template(id) {
  return $(gui_getTemplate(id));
}

gui_state_init("mapEditor");