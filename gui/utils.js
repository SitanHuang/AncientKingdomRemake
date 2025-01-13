
function gui_wrap_timeout_promise(func, timeout=5) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      func();

      setTimeout(() => {
        resolve();
      }, timeout);
    })
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
function gui_crossfade_elements(oldEle, _newEle, ms=400) {
  return gui_fade_away_element(oldEle, ms, 0);
}

function gui_calc_font_color(hex) {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? 'var(--font-color-black)' : 'var(--font-color-white)';
}
function gui_calc_font_color_hex(hex) {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? 0x000000 : 0xffffff;
}

function gui_hex_to_color(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
}

  function gui_format_datestring(dateObj) {
    dateObj = dateObj instanceof Date ? dateObj : new Date(dateObj);

    const year = dateObj.getFullYear();
    const era = year < 0 ? "BCE" : "CE";
    const formattedYear = year < 0 ? Math.abs(year) : year;

    const options = { month: "long", day: "numeric" };
    const formatter = new Intl.DateTimeFormat("en-US", options);
    const formattedDate = formatter.format(dateObj);

    return `${formattedDate}, ${formattedYear} ${era}`;
  }