/**
 * The MapLayer manages rendering of a FIXED SIZE map (though tiles can change)
 */
class MapLayer extends Layer {
  static ZINDEX_BG = 1;
  static ZINDEX_TILELAYER = 10;

  mapObj;
  mapLayerCacheKey = Symbol("mapLayerInstance");
  mapContainer;
  graphicsConfig;

  log = Logger.get("gui.graphics.layers.maplayer");

  calcTileMapCoor(pt) {
    return [pt[1] * this.graphicsConfig.TILE_SIZE, pt[0] * this.graphicsConfig.TILE_SIZE];
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

    // add one time rectangle as background/ocean:
    this.#addBackdrop();

    // create all tiles:
    for (let r = 0; r < this.mapObj.height; r++) {
      for (let c = 0; c < this.mapObj.width; c++) {
        const tile = new TileLayer({
          renderer: this.renderer,
          container: this.mapContainer,
          pt: [r, c],
          mapLayer: this
        });

        this.cacheManager.addDirtyObj(tile, this.mapLayerCacheKey, r, c);
      }
    }

    await this.update(intent);

    this.container.addChild(this.mapContainer);

    this.log.timeEnd("render()");
  }

  async update(_intent) {
    await this.cacheManager.refreshDirtyObjsAsync(async (keys, obj) => {
      if (obj instanceof TileLayer) {
        await obj.render();
      } else if (keys.at(-1) == "backdrop") {
        this.mapContainer.removeChild(obj);
        obj.destroy(true);
        obj = this.#createBackdropGraphics();
        this.mapContainer.addChild(obj);
        return obj;
      }
    }, this.mapLayerCacheKey);
  }

  async cleanup() {
    // TODO: remove all tiles
    this.cacheManager.deleteContainer(this.mapLayerCacheKey);
    this.container.removeChild(this.mapContainer);
    this.mapContainer.destroy(true); // recursive=true
  }

  get mapWidth() {
    return this.mapObj.width * this.graphicsConfig.TILE_SIZE;
  }
  get mapHeight() {
    return this.mapObj.height * this.graphicsConfig.TILE_SIZE;
  }

  #addBackdrop() {
    const bg = this.#createBackdropGraphics();
    this.cacheManager.addFreshObj(
      bg,
      this.mapLayerCacheKey,
      "backdrop"
    );
    this.mapContainer.addChild(bg);
  }

  #createBackdropGraphics() {
    const bg = new PIXI.Graphics();
    bg.beginFill(this.graphicsConfig.MAP_BG);
    bg.drawRect(0, 0, this.mapWidth, this.mapHeight);
    bg.endFill();
    bg.zIndex = MapLayer.ZINDEX_BG;
    bg.label = "Backdrop";
    return bg;
  }
}