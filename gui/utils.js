
function gui_wrap_timeout_promise(func) {
  return new Promise((resolve) => {
    func();

    setTimeout(() => {
      resolve();
    }, 1);
  });
}