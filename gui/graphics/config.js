
class AKRGraphicsConfig {
  TILE_HOVER_BG = [0xffffff, 0.2];
  TILE_SIZE = 100;
  MAP_GRID = false;
  MAP_BG = 0x50647D;

  constructor(overrides={}) {
    Object.assign(this, overrides);
  }

  // TODO: setter functions that refreshes cache
}