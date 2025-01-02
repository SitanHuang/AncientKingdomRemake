function api_response_obj(override) {
  return Object.assign({
    changedPts: [],
    // error?: ["asdaf"],
    // msg?: ["asdaf"],
  }, override);
}

function api_response_obj_merge(r1, r2) {
  const r3 = Object.assign({}, r1);
  for (const key in r1) {
    r3[key] = r1[key].concat(r2[key]);
  }
  return r3;
}