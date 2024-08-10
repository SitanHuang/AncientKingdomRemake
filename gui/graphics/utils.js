
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