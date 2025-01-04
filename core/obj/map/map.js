/**
 * consistent RNG generator for all map generation purposes
 */
function map_gen_rng() {
  return alea('map_gen_rng', { state: false });
}

/**
 * a Map fully defines the physical, playable world, but excludes
 * everything other than the environment (e.g., civs, cultures, ...)
 */
function map_create({ width, height }) {
  if (width > MAP_MAX_LENGTH || height > MAP_MAX_LENGTH)
    throw new Error(`Map dimension (${width} x ${height}) cannot be greater than MAP_MAX_LENGTH=${MAP_MAX_LENGTH}`);

  const map = {
    /**
     * Tiles are a 2-D array with nullable elements
     * indicating "holes" in map (for optimization purposes
     * over the use of terrain)
     *
     * Undefined elements cannot exist. If they exist,
     * out-of-bound access is assumed. JSONs only take in
     * nulls.
     */
    tiles: Array(height).fill(null).map(_ => Array(width).fill(null)),

    width: width,
    height: height,

    /**
     * When set to locked, replacing tiles
     * is no longer possible.
     */
    locked: false,

    _terAuxUpToDate: false,
  };

  return map;
}

function map_mask_create(map, defValue) {
  const rows = Array(map.tiles.length);
  for (let i = 0;i < rows.length;i++) {
    rows[i] = Array(map.tiles[0].length).fill(defValue);
  }
  return rows;
}

function map_set_dirty_tile(map, [row, col]) {
  // TODO: stub
}

function map_at(map, [row, col]) {
  return map.tiles[row] && map.tiles[row][col];
}

function map_set(map, [row, col], tile) {
  map._terAuxUpToDate = false;

  if (map.locked)
    throw "Cannot replace a tile in a Locked Map!";

  if (typeof map_at(map, [row, col]) == 'undefined')
    throw `Cannot set tile at undefined ([${row}, ${col}])!`;

  return map.tiles[row][col] = tile;
}

function map_del(map, [row, col]) {
  map._terAuxUpToDate = false;

  if (map.locked)
    throw "Cannot delete a tile in a Locked Map!";

  if (typeof map_at(map, [row, col]) == 'undefined')
    throw `Cannot delete tile at undefined ([${row}, ${col}])!`;

  map.tiles[row][col] = null;
}

/**
 * UNOPTIMIZED
 *
 * Iterates neighbors instantly (without using cache)
 */
function map_instant_neighbors(map, [r, c], callback) {
  let tmp;

  (tmp = map_at(map, [r - 1, c])) && callback(tmp);
  (tmp = map_at(map, [r + 1, c])) && callback(tmp);
  (tmp = map_at(map, [r, c - 1])) && callback(tmp);
  (tmp = map_at(map, [r, c + 1])) && callback(tmp);
}

/**
 * UNOPTIMIZED
 *
 * Iterates neighbors instantly, without using cache, using slow recursion
 *
 * // TODO: Now we use a radius approach where radius=depth; when map allows
 * //       arbitrary connections, we'll then modify
 */
function map_instant_neighbors_recursive(map, pt, maxDepth, callback, includeSelf=false, depth=0, sampleFilter=null) {
  const minRow = Math.max(0, pt[0] - maxDepth);
  const maxRow = Math.min(map.height, pt[0] + maxDepth);
  const minCol = Math.max(0, pt[1] - maxDepth);
  const maxCol = Math.min(map.width, pt[1] + maxDepth);

  for (let r = minRow; r < maxRow; r++) {
    for (let c = minCol; c < maxCol; c++) {
      const tile = map_at(map, [r, c]);
      if (!tile)
        continue;

      const dist = Math.sqrt((pt[0] - r) ** 2 + (pt[1] - c) ** 2);

      if (
        dist > maxDepth ||
        (!includeSelf && dist == 0) ||
        (sampleFilter && !(sampleFilter(tile, Math.floor(dist))))
      )
        continue;

      callback(tile, dist);
    }
  }
  // const visited = new Set();
  // visited.add(tile_id_from_pt(...pt));

  // if (includeSelf)
  //   callback(map_at(map, pt));

  // map_instant_neighbors(map, pt, tile => {
  //   if (visited.has(tile.id))
  //     return;
  //   if (sampleFilter && !(sampleFilter(tile, depth)))
  //     return;

  //   visited.add(tile.id);

  //   callback(tile);

  //   if (depth + 1 < maxDepth)
  //     map_instant_neighbors_recursive(map, tile.pt, maxDepth, callback, includeSelf = false, depth + 1, sampleFilter);
  // });
}

/**
 * fill map with blank tiles (default terrain)
 */
function map_fill_blank(map) {
  for (let r = 0;r < map.height;r++) {
    for (let c = 0; c < map.width;c++) {
      map_set(map, [r, c], tile_create({ row: r, col: c }));
    }
  }
}
