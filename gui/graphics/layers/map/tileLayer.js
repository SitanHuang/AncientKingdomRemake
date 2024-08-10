class TileLayer extends Layer {
  static ZINDEX_HOVER_OVERLAY = 1000;

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

    // Hover overlay effect
    const destroyHoverOverlay = () => {
      if (this.hoverOverlay)
        this.tileContainer.removeChild(this.hoverOverlay);
    };

    this.container.addChild(this.tileContainer);

    this.tileContainer.on('pointerenter', () => {
      destroyHoverOverlay();
      this.hoverOverlay = new PIXI.Graphics(this.cacheManager.getFreshObjOrReplace((orig) => {
        if (orig) {
          orig.destroy(true);
        }

        orig = new PIXI.GraphicsContext();
        orig.rect(0, 0, this.TILE_SIZE, this.TILE_SIZE);
        orig.fill(...this.mapLayer.graphicsConfig.TILE_HOVER_BG);

        return orig;
      }, this.mapLayer.mapLayerCacheKey, "tileHoverBackdrop"));
      this.hoverOverlay.zIndex = TileLayer.ZINDEX_HOVER_OVERLAY;
      this.hoverOverlay.eventMode = 'none';
      this.tileContainer.addChild(this.hoverOverlay);
    });
    this.tileContainer.on('pointerleave', destroyHoverOverlay);
    this.tileContainer.eventMode = 'static';

    // const tileObj = map_at(this.mapLayer.mapObj, this.pt);
  }

  async cleanup() {
    // remove from MapLayer's Container
    this.container.removeChild(this.tileContainer);
    this.tileContainer.destroy(true); // recursively destroy children
  }
}