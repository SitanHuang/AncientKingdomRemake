
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