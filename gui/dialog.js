let gui_dialog_loading_begin;
let gui_dialog_loading_progress;
let gui_dialog_loading_end;

(function() {
  let $box;
  let $progress;

  gui_dialog_loading_begin = async function ({
    progress=false,
  }={}) {
    await gui_wrap_timeout_promise(() => {
      $box?.remove();
      $box = gui_get$Template('template-loading-box').clone().appendTo($uiLayer);

      progress && ($progress = $box.find('.progress-con').show());
    });
  }

  gui_dialog_loading_progress = async function (progress, throttleInterval = 500, timeout = 50) {
    await gui_wrap_timeout_promise_throttled(() => {
      $progress?.find('.progress').css('width', (progress * 100) + '%');
    }, throttleInterval, timeout);
  };

  gui_dialog_loading_end = async function() {
    await gui_wrap_timeout_promise(() => {
      $box?.remove();
    });
  }
})();
