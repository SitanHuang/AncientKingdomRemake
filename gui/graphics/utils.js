
/**
 * Ensures consistent implementation of offsetX/Y across browsers.
 *
 * (Sometimes Firefix sets offsetX/Y to zero after event has gone away)
 */
function calcOffsetCoors(e) {
  let rect = (e.target || e.srcElement).getBoundingClientRect();

  e.offsetX = e.clientX - rect.left;
  e.offsetY = e.clientY - rect.top;
  e.canvasX = e.clientX - rect.left;
  e.canvasY = e.clientY - rect.top;
}

function gui_graphics_getFreshSquareOrReplace(cacheManager, x, y, width, height, color, alpha, ...keys) {
  return cacheManager.getFreshObjOrReplace((orig) => {
    if (orig) {
      orig.destroy(true);
    }

    Logger.get("gui.graphics.getFreshSquareOrReplace").warn('redrawing square ' + color + ' ' + alpha);

    orig = new PIXI.GraphicsContext();
    orig.rect(x, y, width, height);
    orig.fill(color, alpha);

    return orig;
  }, ...keys);
}