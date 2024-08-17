async function gui_dialog_loading_begin() {
  await gui_wrap_timeout_promise(() => {
    gui_get$Template('template-loading-box').clone().appendTo($uiLayer);
  });
}
async function gui_dialog_loading_end() {
  await gui_wrap_timeout_promise(() => {
    $uiLayer.find('.template-loading-box').remove();
  });
}