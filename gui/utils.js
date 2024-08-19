
function gui_wrap_timeout_promise(func, timeout=5) {
  return new Promise((resolve) => {
    func();

    setTimeout(() => {
      resolve();
    }, timeout);
  });
}
