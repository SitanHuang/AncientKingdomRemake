/**
 * This file draws the terrain graphics for a tile.
 *
 * Functions should be called on a blank tileContainer (e.g., from tileLayer.render())
 */
;

async function gui_graphics_tile_drawterrain(tileLayer, tileContainer, tileObj) {
  // Holes
  if (tileObj == null || tileObj.ter == KEY_TER_DEFAULT || tileObj.ter == KEY_TER_PLAIN)
    return;

  const { TILE_SIZE, TILE_TERRAIN_TINT, TILE_RIVER_COLOR } = tileLayer.graphicsConfig;

  let ctx;

  if (tileObj.ter == KEY_TER_MOUNTAIN) {
    ctx = PIXI.Texture.from(document.getElementById('assets-ter-mountain'));
  } else if (tileObj.ter == KEY_TER_MOUNTAIN2) {
    ctx = PIXI.Texture.from(document.getElementById('assets-ter-mountain2'));
  } else if (tileObj.ter == KEY_TER_HILL) {
    ctx = PIXI.Texture.from(document.getElementById('assets-ter-hill'));
  } else if (tileObj.ter == KEY_TER_STEPPE) {
    ctx = PIXI.Texture.from(document.getElementById('assets-ter-steppe'));
  } else if (tileObj.ter == KEY_TER_DESERT) {
    ctx = PIXI.Texture.from(document.getElementById('assets-ter-desert'));
  } else if (tileObj.ter == KEY_TER_RIVER) {
    const riverGType = tileObj.terAux.riverGType || 0b1111;

    const g = tileLayer.cacheManager.getFreshObjOrReplace((orig) => {
      if (orig) {
        orig.destroy(true);
      }

      Logger.get("gui.graphics.map.tilegraphics.terrain").warn('redrawing river type ' + riverGType.toString(2));

      const stripeWidth = TILE_SIZE * 0.2;
      const stripeHeight = (TILE_SIZE + stripeWidth) / 2;
      const offCenter = (TILE_SIZE - stripeWidth) / 2;

      orig = new PIXI.GraphicsContext();

      // top
      (riverGType & 0b1000) && orig.rect(offCenter, 0, stripeWidth, stripeHeight);
      // bottom
      (riverGType & 0b0010) && orig.rect(offCenter, offCenter, stripeWidth, stripeHeight);
      // left
      (riverGType & 0b0001) && orig.rect(0, offCenter, stripeHeight, stripeWidth);
      // right
      (riverGType & 0b0100) && orig.rect(offCenter, offCenter, stripeHeight, stripeWidth);

      orig.fill(TILE_RIVER_COLOR);

      return orig;
    }, tileLayer.mapLayer.mapLayerCacheKey, "river", riverGType);

    const riverCon = new PIXI.Container();
    riverCon.addChild(new PIXI.Graphics(g));
    riverCon.zIndex = TileLayer.ZINDEX_TERRAIN_SQUARE;
    riverCon.eventMode = 'none';
    tileContainer.addChild(riverCon);

    return;
  }

  if (ctx) {
    // const con = new PIXI.Graphics(ctx);
    const con = new PIXI.Sprite(ctx);
    con.width = TILE_SIZE;
    con.height = TILE_SIZE;
    con.zIndex = TileLayer.ZINDEX_TERRAIN_SQUARE;
    con.eventMode = 'none';
    con.tint = TILE_TERRAIN_TINT;
    con.alpha = 0.7;

    tileContainer.addChild(con);
  }
}