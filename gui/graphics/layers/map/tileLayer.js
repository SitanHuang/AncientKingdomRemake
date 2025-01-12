class TileLayer extends Layer {
  static ZINDEX_HOVER_OVERLAY = 1000;
  static ZINDEX_NONSELECTABLE_OVERLAY = 900;

  static ZINDEX_TERRAIN_SQUARE = 50;
  static ZINDEX_COLOR_LAYER = 20;
  static ZINDEX_OCCUPIER_SQUARE = 20;
  static ZINDEX_OWNER_SQUARE = 10;

  gamestate;
  mapObj;

  pt;
  mapLayer;

  tileContainer;

  colorScaleSquare;

  // the color of the border when a tile is selected (falsy if unselected)
  selectionBorderColor;

  nonselectableOverlay;
  hoverOverlay;

  constructor({ renderer, container, pt, mapLayer }) {
    super({ renderer, container });

    this.pt = pt;
    this.mapLayer = mapLayer;

    this.gamestate = mapLayer.gamestate;
    this.mapObj = mapLayer.mapObj;
  }

  get tileObj() {
    return map_at(this.mapLayer.mapObj, this.pt);
  }

  get TILE_SIZE() {
    return this.mapLayer.graphicsConfig.TILE_SIZE;
  }

  get graphicsConfig() {
    return this.mapLayer.graphicsConfig;
  }

  async render() {
    if (this.tileContainer)
      await this.cleanup();

    this.tileContainer = new PIXI.Container();
    this.tileContainer.label = `TileLayer ${this.pt}`;
    this.tileContainer.zIndex = MapLayer.ZINDEX_TILELAYER;
    this.tileContainer.sortableChildren = true;

    const [x, y] = this.mapLayer.calcTileMapCoor(this.pt);

    const bounds = new PIXI.Rectangle(0, 0, this.TILE_SIZE, this.TILE_SIZE);
    const hitArea = new PIXI.Rectangle(0, 0, this.TILE_SIZE, this.TILE_SIZE);

    this.tileContainer.x = x;
    this.tileContainer.y = y;
    this.tileContainer.boundsArea = bounds;
    this.tileContainer.hitArea = hitArea;
    this.tileContainer.zIndex = MapLayer.ZINDEX_TILELAYER;

    this.container.addChild(this.tileContainer);

    this.tileContainer.eventMode = 'dynamic';

    const tileObj = this.tileObj;

    gui_graphics_tile_drawcolor(this, this.tileContainer, tileObj);

    await gui_graphics_tile_drawterrain(this, this.tileContainer, tileObj);

    this.createNonselectableOverlay();
  }

  destroyHoverOverlay()  {
    if (this.hoverOverlay) {
      this.hoverOverlay.destroy({ context: false });
      this.hoverOverlay = null;
    }
  }

  createNonselectableOverlay() {
    if (this.nonselectableOverlay) {
      this.nonselectableOverlay.destroy({ context: false });
      this.nonselectableOverlay = null;
    }

    this.nonselectableOverlay = new PIXI.Graphics(this.cacheManager.getFreshObjOrReplace((orig) => {
      if (orig) {
        orig.destroy(true);
      }

      Logger.get("gui.graphics.layers.tilelayer").warn('redrawing nonselectablebackdrop');

      orig = new PIXI.GraphicsContext();
      orig.rect(0, 0, this.TILE_SIZE, this.TILE_SIZE);
      orig.fill(...this.graphicsConfig.TILE_NONSELECTABLE_BG);

      return orig;
    }, this.mapLayer.mapLayerCacheKey, "tileNonselectableBackdrop"));

    this.nonselectableOverlay.zIndex = TileLayer.ZINDEX_NONSELECTABLE_OVERLAY;
    this.nonselectableOverlay.eventMode = 'none';

    // We might be called to re-render a dirty tile in the middle
    // of a selection process.
    this.nonselectableOverlay.visible = (
      this.renderer.selectionStarted ?
        !this.renderer.selectableMask[this.pt[0]][this.pt[1]] :
        false
    );

    this.tileContainer.addChild(this.nonselectableOverlay);
  }

  createHoverOverlay() {
    this.destroyHoverOverlay();

    this.hoverOverlay = new PIXI.Graphics(this.cacheManager.getFreshObjOrReplace((orig) => {
      if (orig) {
        orig.destroy(true);
      }

      Logger.get("gui.graphics.layers.tilelayer").warn('redrawing hoverbackdrop');

      orig = new PIXI.GraphicsContext();
      orig.rect(0, 0, this.TILE_SIZE, this.TILE_SIZE);
      orig.fill(...this.graphicsConfig.TILE_HOVER_BG);

      return orig;
    }, this.mapLayer.mapLayerCacheKey, "tileHoverBackdrop"));

    this.hoverOverlay.zIndex = TileLayer.ZINDEX_HOVER_OVERLAY;
    this.hoverOverlay.eventMode = 'none';
    this.tileContainer.addChild(this.hoverOverlay);
  }

  async cleanup() {
    // remove from MapLayer's Container
    this.tileContainer.destroy({
      children: true,
      context: false,
      textureSource: false,
    }); // recursively destroy children but not reused contexts
    this.tileContainer = null;
  }

  getFreshSquareOrReplace(color, alpha, ...lastKeys) {
    return gui_graphics_getFreshSquareOrReplace(
      this.cacheManager,
      0,
      0,
      this.TILE_SIZE,
      this.TILE_SIZE,
      color,
      alpha,
      this.mapLayer.mapLayerCacheKey,
      ...lastKeys
    );
  }
  getFreshSquareOrReplaceCustom(color, alpha, x, y, w, h, ...lastKeys) {
    return gui_graphics_getFreshSquareOrReplace(
      this.cacheManager,
      x,
      y,
      w,
      h,
      color,
      alpha,
      this.mapLayer.mapLayerCacheKey,
      ...lastKeys
    );
  }
}