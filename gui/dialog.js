let gui_dialog_loading_begin;
let gui_dialog_loading_progress;
let gui_dialog_loading_end;

let gui_dialog_raise;
let gui_dialog_alert;
let gui_dialog_confirm;
let gui_dialog_prompt;

// Loading screens
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
  };
})();

// User prompts
(function () {
  let $box;

  gui_dialog_alert = async function (message = "", opts = {}) {
    return await gui_dialog_raise(Object.assign({ message, cancel: false }, opts));
  };

  gui_dialog_confirm = async function (message = "", opts = {}) {
    return await gui_dialog_raise(Object.assign({ message, cancel: true }, opts));
  };

  gui_dialog_prompt = async function (message = "", defValue = "", opts = {}) {
    return await gui_dialog_raise(Object.assign({
      message,
      inputVal: defValue,
      input: "text"
    }, opts));
  };

  gui_dialog_raise = async function({
    message = "",
    status = "normal", // "normal" / "error" / "warning" / "success"
    cancel = true,
    wide = false,
    cancelTxt = "Cancel",
    okayTxt = "OK",
    input = false, // "text" / "number"
    min = null,
    max = null,
    valMinMax = false,
    inputPlch = '',
    inputVal = '',
  } = {}) {
    $box?.remove();
    $box = gui_get$Template('template-dialog-box').clone().appendTo($uiLayer);

    $box.find('.dialog-box')
      .toggleClass('wide', !!wide)
      .attr("data-status", status);

    $box.find("item.cancel").toggle(!!cancel);

    $box.find(".dialog-text").text(message);

    $box.find("item.cancel").text(cancelTxt);
    $box.find("item.confirm").text(okayTxt);

    const inputContainer = $box.find('.input-con')[0];
    const inputEle = $box.find('.input-con input')[0];

    if (input) {
      inputContainer.style.display = 'block';
      inputEle.type = input;
      inputEle.placeholder = inputPlch || '';
      inputEle.value = inputVal || '';
      inputEle.min = min;
      inputEle.max = max;
    } else {
      inputContainer.style.display = 'none';
    }

    $box.hide().fadeIn({ duration: 250 });

    inputEle.focus({ focusVisible: true });
    inputEle.select();

    return new Promise(resolve => {
      const primaryBtn = $box.find("item.confirm")[0];
      primaryBtn.onclick = submitModalAndResolve;

      const closeBtn = $box.find("item.cancel")[0];
      closeBtn.onclick = closeModalAndResolve;

      if (input) {
        $(inputEle).unbind('keydown').bind('keydown', function (e) {
          // no need to prevent modal from closing prematurely on enter since we
          // don't have form element
          e.keyCode === 13 && submitModalAndResolve();
        });
      }

      function closeModalAndResolve() {
        $box.remove();

        primaryBtn.onclick = null;
        closeBtn.onclick = null;

        resolve(input ? null : false);
      }
      function submitModalAndResolve() {
        const val = inputEle.value;

        if (valMinMax && (val < min || val > max))
          return;

        $box.remove();

        resolve(input ? val : true);
      }
    });
  };
})();