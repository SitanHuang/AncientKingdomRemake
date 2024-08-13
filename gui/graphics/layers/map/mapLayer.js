/**
 * The MapLayer manages rendering of a FIXED SIZE map (though tiles can change)
 */
class MapLayer extends Layer {
  static ZINDEX_BG = 1;
  static ZINDEX_TILELAYER = 10;

  mapObj;
  mapLayerCacheKey = Symbol("mapLayerInstance");
  graphicsConfig;

  mapContainer;
  tilesContainer;

  log = Logger.get("gui.graphics.layers.maplayer");

  calcTileMapCoor(pt) {
    return [pt[1] * this.graphicsConfig.TILE_SIZE, pt[0] * this.graphicsConfig.TILE_SIZE];
  }

  calcMapCoorFromPIXIPt(pt) {
    const coor = [Math.floor(pt.y / this.graphicsConfig.TILE_SIZE), Math.floor(pt.x / this.graphicsConfig.TILE_SIZE)];

    return coor[0] < 0 || coor[1] < 0 ||
      coor[0] > this.mapObj.height ||
      coor[1] > this.mapObj.width ? null : coor;
  }

  async init({ mapObj, graphicsConfig }) {
    this.mapObj = mapObj;
    this.graphicsConfig = graphicsConfig;
    this.cacheManager.deleteContainer(this.mapLayerCacheKey);
  }

  async render(intent) {
    this.log.time("render()");

    if (this.mapContainer) {
      await this.cleanup();
    }

    this.mapContainer = new PIXI.Container();
    this.mapContainer.label = `MapLayer`;
    this.mapContainer.sortableChildren = true;
    this.mapContainer.interactiveChildren = true;
    this.mapContainer.eventMode = 'passive';

    // For everythiing in tilesContainer, mapLayer takes over the events
    // firing; this allows 255x255 maps to run smoothly whereas without this
    // we can only get 30fps
    this.tilesContainer = new PIXI.Container();
    this.tilesContainer.label = `TilesLayer`;
    this.tilesContainer.sortableChildren = false;
    this.tilesContainer.interactiveChildren = false;
    this.tilesContainer.eventMode = 'none';
    this.tilesContainer.zIndex = MapLayer.ZINDEX_TILELAYER;

    // add one time rectangle as background/ocean:
    this.#addBackdrop();

    // create all tiles:
    for (let r = 0; r < this.mapObj.height; r++) {
      for (let c = 0; c < this.mapObj.width; c++) {
        const tile = new TileLayer({
          renderer: this.renderer,
          container: this.tilesContainer,
          pt: [r, c],
          mapLayer: this
        });

        this.cacheManager.addDirtyObj(tile, this.mapLayerCacheKey, r, c);
      }
    }

    await this.update(intent);

    this.mapContainer.addChild(this.tilesContainer);
    this.container.addChild(this.mapContainer);

    this.log.timeEnd("render()");
  }

  setTileAsDirty([row, col]) {
    this.cacheManager.setDirty(this.mapLayerCacheKey, row, col);
  }

  async update(_intent) {
    await this.cacheManager.refreshDirtyObjsAsync(async (keys, obj) => {
      if (obj instanceof TileLayer) {
        await obj.render();
      } else if (keys.at(-1) == "backdrop") {
        obj.destroy(true);
        obj = this.#createBackdropGraphics();
        this.tilesContainer.addChild(obj);
        return obj;
      }
    }, this.mapLayerCacheKey);
  }

  async cleanup() {
    this.cacheManager.deleteContainer(this.mapLayerCacheKey); // makes sure we don't reuse those undrawable, cached GraphicContexts
    this.mapContainer.destroy(true); // recursive=true, including contexts
  }

  get mapWidth() {
    return this.mapObj.width * this.graphicsConfig.TILE_SIZE;
  }
  get mapHeight() {
    return this.mapObj.height * this.graphicsConfig.TILE_SIZE;
  }

  hookEventsToViewport(viewport) {
    // On hover:
    let _oldTile = null;
    viewport.registerOnHover("mapLayer", (pt) => {
      _oldTile?.tileContainer.emit("pointerleave");
      _oldTile = null;

      const coor = this.calcMapCoorFromPIXIPt(pt);
      _oldTile = coor ? this.cacheManager.getFreshObjOrNull(this.mapLayerCacheKey, coor[0], coor[1]) : null;

      _oldTile?.tileContainer.emit("pointerenter");
    });
  }

  #addBackdrop() {
    const bg = this.#createBackdropGraphics();
    this.cacheManager.addFreshObj(
      bg,
      this.mapLayerCacheKey,
      "backdrop"
    );
    this.tilesContainer.addChild(bg);
  }

  #createBackdropGraphics() {
    const bg = new PIXI.Graphics();
    bg.beginFill(this.graphicsConfig.MAP_BG);
    bg.drawRect(0, 0, this.mapWidth, this.mapHeight);
    bg.endFill();
    bg.zIndex = MapLayer.ZINDEX_BG;
    bg.label = "Backdrop";
    bg.eventMode = 'none';
    return bg;
  }
}