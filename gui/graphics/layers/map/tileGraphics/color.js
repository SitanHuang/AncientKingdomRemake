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

  const { TILE_SIZE, TILE_GAP_PX, TILE_BG, TILE_OWNER_NULL_COLOR } = tileLayer.graphicsConfig;

  // BG square:
  const bgSquare = new PIXI.Graphics(
    tileLayer.getFreshSquareOrReplace(
      TILE_BG, 0.8,
      "bgSquare"
    )
  );

  bgSquare.zIndex = TileLayer.ZINDEX_OWNER_SQUARE;
  bgSquare.eventMode = 'none';

  tileContainer.addChild(bgSquare);

  // Owner square

  // TODO: get correct player color
  const ownerColor = TILE_OWNER_NULL_COLOR;

  const ownerSquare = new PIXI.Graphics(
    tileLayer.getFreshSquareOrReplaceCustom(
      ownerColor, 0.8,
      TILE_GAP_PX, TILE_GAP_PX,
      TILE_SIZE - TILE_GAP_PX, TILE_SIZE - TILE_GAP_PX,
      "ownerSquares", ownerColor
    )
  );

  ownerSquare.zIndex = TileLayer.ZINDEX_OWNER_SQUARE;
  ownerSquare.eventMode = 'none';

  tileContainer.addChild(ownerSquare);

  // TODO: draw occupier stripes
}