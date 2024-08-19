/**
 * Estimates the nominal byte size of an object
 */
function sizeOf(obj, visited = new Set()) {
  let bytes = 0;
  if (obj !== null && obj !== undefined) {
    switch (typeof obj) {
      case "number":
        bytes += 8;
        break;
      case "string":
        bytes += obj.length * 2;
        break;
      case "boolean":
        bytes += 4;
        break;
      case "object":
        if (visited.has(obj))
          break;
        visited.add(obj);
        var objClass = Object.prototype.toString.call(obj).slice(8, -1);
        if (objClass === "Object" || objClass === "Array") {
          for (var key in obj) {
            if (obj.hasOwnProperty && !obj.hasOwnProperty(key)) continue;
            bytes += sizeOf(obj[key], visited);
          }
        } else bytes += obj.toString().length * 2;
        break;
    }
  }
  return bytes;
}

function ptEq(pt1, pt2) {
  return pt1[0] == pt2[0] && pt1[1] == pt2[1];
}
