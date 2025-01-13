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

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

/**
 * Allows hooking a dynamic, runtime reference while still keeping an obj
 * JSON-compliant
 */
function hook_nonenumerable_ref(obj, key, ref) {
  Object.defineProperty(obj, key, {
    enumerable: false,
    value: ref
  });
}

function assert(stmt, msg='') {
  if (!stmt)
    throw new Error(`Assertion failed: ${msg}`);
}