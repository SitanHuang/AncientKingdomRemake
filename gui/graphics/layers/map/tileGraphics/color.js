/**
 * This file draws the owner/occupier graphics for a tile.
 *
 * Functions should be called on a blank tileContainer (e.g., from tileLayer.render())
 */
;
function gui_graphics_tile_drawcolor(tileLayer, tileContainer, tileObj) {
  // Holes
  if (tileObj == null)
    return;

  const { TILE_SIZE, TILE_GAP_PX, TILE_BG, TILE_OWNER_NULL_COLOR, TILE_BORDER_SELECTED_PX } = tileLayer.graphicsConfig;
  const gs = tileLayer.gamestate;

  // BG square:
  const bgSquare = new PIXI.Graphics(
    tileLayer.getFreshSquareOrReplace(
      TILE_BG, 0.8,
      "bgSquare"
    )
  );

  bgSquare.zIndex = TileLayer.ZINDEX_OWNER_SQUARE - 2;
  bgSquare.eventMode = 'none';

  tileContainer.addChild(bgSquare);

  // Border square
  if (Number.isInteger(tileLayer.selectionBorderColor)) {
    const neighbors = [1, 1, 1, 1]; // top, right, bottom, left
    const coors = [
      [tileLayer.pt[0] - 1, tileLayer.pt[1]],
      [tileLayer.pt[0], tileLayer.pt[1] + 1],
      [tileLayer.pt[0] + 1, tileLayer.pt[1]],
      [tileLayer.pt[0], tileLayer.pt[1] - 1],
    ];

    for (let i = 0;i < coors.length;i++) {
      // use getObjForce here bc the neighbors are set to dirty by mapRenderer
      const tLayer2 = tileLayer.cacheManager.getObjForce(tileLayer.mapLayer.mapLayerCacheKey, ...coors[i]);
      if (tLayer2?.selectionBorderColor === tileLayer.selectionBorderColor)
        neighbors[i] = 0; // no border
    }

    const borderSquare = new PIXI.Graphics(
      tileLayer.getFreshSquareOrReplaceCustom(
        tileLayer.selectionBorderColor, 1,
        neighbors[3] ? 0 : TILE_GAP_PX,
        neighbors[0] ? 0 : TILE_GAP_PX,
        TILE_SIZE - (neighbors[3] ? 0 : TILE_BORDER_SELECTED_PX) - (neighbors[1] ? 0 : TILE_BORDER_SELECTED_PX),
        TILE_SIZE - (neighbors[0] ? 0 : TILE_BORDER_SELECTED_PX) - (neighbors[2] ? 0 : TILE_BORDER_SELECTED_PX),
        "selectionBorderSquares_" + neighbors.join(""), tileLayer.selectionBorderColor
      )
    );

    borderSquare.zIndex = TileLayer.ZINDEX_OWNER_SQUARE - 1;
    borderSquare.eventMode = 'none';

    tileContainer.addChild(borderSquare);
  }

  // TODO: actual civ border


  // Owner square

  const ownerColor = gs && tile_is_uncivilized(tileObj) ?
    TILE_OWNER_NULL_COLOR :
    tile_get_owner(gs, tileObj).color;

  const ownerSquare = new PIXI.Graphics(
    tileLayer.getFreshSquareOrReplaceCustom(
      ownerColor, 0.8,
      TILE_GAP_PX, TILE_GAP_PX,
      TILE_SIZE - 2 * TILE_GAP_PX, TILE_SIZE - 2 * TILE_GAP_PX,
      "ownerSquares", ownerColor
    )
  );

  ownerSquare.zIndex = TileLayer.ZINDEX_OWNER_SQUARE;
  ownerSquare.eventMode = 'none';

  tileContainer.addChild(ownerSquare);

  // TODO: draw occupier stripes
}

function gui_graphics_tile_get_painted_owner_color(gs, gfxConfig, coor) {
  const { TILE_OWNER_NULL_COLOR } = gfxConfig;

  if (gs?.map)
    return TILE_OWNER_NULL_COLOR;

  const tile = map_at(gs.map, coor);

  if (!tile)
    return TILE_OWNER_NULL_COLOR;

  const civ = tile_get_owner(gs, tile);

  return Number.isInteger(civ.color) ? civ.color : TILE_OWNER_NULL_COLOR;
}