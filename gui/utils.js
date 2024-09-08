
function gui_wrap_timeout_promise(func, timeout=5) {
  return new Promise((resolve) => {
    func();

    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

let gui_wrap_timeout_promise_throttled = (function() {
  let lastInvocationTime = 0;

  return async (func, throttleInterval = 300, timeout = 25) => {
    const currentTime = Date.now();
    if (currentTime - lastInvocationTime > throttleInterval) {
      lastInvocationTime = currentTime;
      await new Promise((resolve) => {
        func();

        setTimeout(() => {
          resolve();
        }, timeout);
      });
    }
  };
})();

function gui_fade_away_element(ele, ms=400, target=0) {
  return new Promise((resolve) => {
    $(ele).animate({ opacity: target }, ms, function () {
      resolve();
    });
  });
}
function gui_crossfade_elements(oldEle, newEle, ms=400) {
  return Promise.all([
    gui_fade_away_element(oldEle, ms, 0),
    gui_fade_away_element(newEle, ms, 1)
  ]);
}