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
    tiles: Array(height).fill(null).map(x => Array(width).fill(null)),

    width: width,
    height: height,

    /**
     * When set to locked, replacing tiles
     * is no longer possible.
     */
    locked: false,
  };

  return map;
}

function map_at(map, [row, col]) {
  return map.tiles[row] && map.tiles[row][col];
}

function map_set(map, [row, col], tile) {
  if (map.locked)
    throw "Cannot replace a tile in a Locked Map!";

  if (typeof map_at(map, [row, col]) == 'undefined')
    throw `Cannot set tile at undefined ([${row}, ${col}])!`;

  return map.tiles[row][col] = tile;
}

function map_del(map, [row, col]) {
  if (map.locked)
    throw "Cannot delete a tile in a Locked Map!";

  if (typeof map_at(map, [row, col]) == 'undefined')
    throw `Cannot delete tile at undefined ([${row}, ${col}])!`;

  map.tiles[row][col] = null;
}

/**
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
 * fill map with blank tiles (default terrain)
 */
function map_fill_blank(map) {
  for (let r = 0;r < map.height;r++) {
    for (let c = 0; c < map.width;c++) {
      map_set(map, [r, c], tile_create({ row: r, col: c }));
    }
  }
}