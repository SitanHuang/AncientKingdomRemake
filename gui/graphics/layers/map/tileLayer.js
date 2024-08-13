class TileLayer extends Layer {
  static ZINDEX_HOVER_OVERLAY = 1000;
  static ZINDEX_TERRAIN_SQUARE = 10;
  static ZINDEX_OCCUPIER_SQUARE = 2;
  static ZINDEX_OWNER_SQUARE = 1;

  pt;
  mapLayer;

  tileContainer;

  hoverOverlay;

  constructor({ renderer, container, pt, mapLayer }) {
    super({ renderer, container });

    this.pt = pt;
    this.mapLayer = mapLayer;
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

    const bounds = new PIXI.Rectangle(x, y, this.TILE_SIZE, this.TILE_SIZE);
    const hitArea = new PIXI.Rectangle(0, 0, this.TILE_SIZE, this.TILE_SIZE);

    this.tileContainer.x = x;
    this.tileContainer.y = y;
    this.tileContainer.boundsArea = bounds;
    this.tileContainer.hitArea = hitArea;
    this.tileContainer.zIndex = MapLayer.ZINDEX_TILELAYER;

    // Hover overlay effect
    const destroyHoverOverlay = () => {
      if (this.hoverOverlay) {
        this.hoverOverlay.destroy({ context: false });
        this.hoverOverlay = null;
      }
    };

    this.container.addChild(this.tileContainer);

    this.tileContainer.on('pointerenter', () => {
      destroyHoverOverlay();

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
    });
    this.tileContainer.on('pointerleave', destroyHoverOverlay);

    this.tileContainer.eventMode = 'dynamic';

    const tileObj = map_at(this.mapLayer.mapObj, this.pt);

    gui_graphics_tile_drawcolor(this, this.tileContainer, tileObj);

    await gui_graphics_tile_drawterrain(this, this.tileContainer, tileObj);
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