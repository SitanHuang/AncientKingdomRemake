
class AKRGraphicsConfig {
  TILE_OWNER_NULL_COLOR = 0xffffff;

  TILE_HOVER_BG = [0xffffff, 0.2];
  TILE_RIVER_COLOR = 0x1976D2;
  TILE_BG = 0xFAFAFA;
  TILE_SIZE = 100;

  TILE_TERRAIN_TINT = 0x2e2e2e;

  TILE_GAP_PX = 2;

  MAP_GRID = false;
  MAP_BG = 0x50647D;

  constructor(overrides={}) {
    Object.assign(this, overrides);
  }

  // TODO: setter functions that refreshes cache
}