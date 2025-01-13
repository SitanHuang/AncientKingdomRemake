
class MapRenderer extends Renderer {

  graphicsConfig = new AKRGraphicsConfig();
  viewport;

  gamestate; // pointer to gamestate in memory (optional)
  mapObj; // pointer to gamestate.map in memory

  /**
   * A callback on pointerenter to return true when tile should display a hover
   * overlay effect.
   *
   * (mapCoor=[row, col]) => boolean
   */
  onTileHoverOverlay;
  /**
   * A callback on pointerenter to optionally create a tooltip element.
   * The created element is automatically destroyed on pointerleave.
   *
   * (mapCoor=[row, col]) => false | $tooltipChild
   */
  onTileTooltip;

  /**
   * A callback on pointerenter to change the cursor type of a tile;
   *
   * If returning falsy, the canvas pointer will not changed.
   *
   * If the callback is null, then canvas pointer will be unset.
   *
   * (mapCoor=[row, col]) => falsy | string
   */
  onCursorType;

  mapLayer;

  selectableMask;
  selectionStarted = false;
  selectedPts = [];

  async begin({ gamestate, mapObj }) {
    await super.begin();

    this.gamestate = gamestate;
    this.mapObj = mapObj;

    this.resetSelectableMask();

    const app = this.app;

    const viewport = this.viewport = new Viewport({ renderer: this });
    viewport.zoom = 0.2;
    viewport.applyZoom();

    app.stage.addChild(viewport.container);

    viewport.hookEvents();

    this.mapLayer = new MapLayer({ renderer: this, container: viewport.container });
    await this.mapLayer.init({
      mapObj,
      gamestate,
      graphicsConfig: this.graphicsConfig
    });

    this.mapLayer.hookEventsToViewport(viewport);

    await this.mapLayer.render();

    this.containerElement.appendChild(this.app.canvas);
  }

  resetSelectableMask() {
    this.selectableMask = map_mask_create(this.mapObj, false);
  }

  async beginSelection({
    mask = null,

    /**
     * A callback on click and brush.
     *
     * Set callback to falsy if selection functionality is not used.
     *
     * Returns falsy if the selection process should terminate.
     *
     * Returns [color, alpha] if the selected tile should be highlighted in the
     * provided color; a trusy return value would use the default color.
     *
     * ([row, col]) => falsy | [color, alpha] | trusy
     */
    onTileSelect = async (_pt) => {},

    overlay = true,

    // set to false if leaving untouched for below handlers:
    onTileTooltip = null,
    onCursorType = (coor) => map_mask_at(this.selectableMask, coor) ? 'pointer' : 'not-allowed',

    callback = null, // alias to endSelectionOpts.callback but not after the pre-selection endSelectino call

    endSelectionOpts = {}, // arguments passed to endSelection
  }={}) {
    this.selectedPts = [];
    this.selectionStarted && (await this.endSelection(endSelectionOpts));

    callback && (endSelectionOpts.callback = callback);

    this.selectionStarted = true;

    mask && (this.selectableMask = mask);

    this.mapLayer.applySelectableMask(this.selectableMask);

    if (overlay)
      this.onTileHoverOverlay = (coor) => !!map_mask_at(this.selectableMask, coor);

    if (onTileTooltip !== false)
      this.onTileTooltip = onTileTooltip;
    if (onCursorType !== false)
      this.onCursorType = onCursorType;

    if (!onTileSelect)
      return;

    // Handle selection logics

    this.viewport.registerOnBrush("mapRendererSelection", async (pt) => {
      const coor = this.mapLayer.calcMapCoorFromPIXIPt(pt);

      if (!coor || !map_at(this.mapObj, coor) ||
        !this.selectableMask[coor[0]][coor[1]] || this.checkTileSelected(coor))
        return;

      this.selectedPts.push(coor);

      const result = await onTileSelect(coor);

      // Default border color to the font color of tile owner
      let color = gui_calc_font_color_hex(gui_graphics_tile_get_painted_owner_color(this.gamestate, this.graphicsConfig, coor));

      if (!result) {
        // Terminate selection
        this.endSelection(endSelectionOpts);
        return;
      }

      if (Array.isArray(result))
        color = result;

      const tile = this.cacheManager.getFreshObjOrNull(this.mapLayer.mapLayerCacheKey, ...coor);
      tile.selectionBorderColor = color;

      map_instant_neighbors(this.mapObj, coor, tileObj => {
        this.mapLayer.setTileAsDirty(tileObj.pt);
      });

      this.mapLayer.setTileAsDirty(coor);
      await this.updateMapLayer();
    });

    renderer.viewport.beginBrush();
  }

  async endSelection({
    destroyListeners = true,
    repaintSelectedTiles = true,
    callback = null,
  }={}) {
    this.mapLayer.applySelectableMask();
    this.selectionStarted = false;

    if (destroyListeners) {
      this.onTileHoverOverlay = null;
      this.onTileTooltip = null;
      this.onCursorType = null;
      this.viewport.removeOnBrush("mapRendererSelection");
      this.viewport.endBrush();
    }

    if (repaintSelectedTiles) {
      for (let i = 0;i < this.selectedPts.length;i++) {
        const coor = this.selectedPts[i];
        const tile = this.cacheManager.getObjForce(this.mapLayer.mapLayerCacheKey, ...coor);

        tile.selectionBorderColor = null;
        this.mapLayer.setTileAsDirty(coor);
      }
      await this.updateMapLayer();
    }

    callback && (await callback(this.selectedPts));
  }

  async resetTransientActions() {
    await this.endSelection();
  }

  checkTileSelected(coor) {
    for (let i = 0;i < this.selectedPts?.length;i++) {
      if (ptEq(coor, this.selectedPts[i]))
        return true;
    }
    return false;
  }

  applyCursor(type) {
    if (!type && typeof type != 'string')
      return;

    this.containerElement.style.cursor = type;
  }

  async updateMapLayer(_intent) {
    await this.mapLayer.update(_intent);
  }

  async clearGamestateDirtyTiles() {
    const queue = this.gamestate?._changedTiles;

    if (!queue)
      return;

    for (const pt of queue) {
      this.mapLayer.setTileAsDirty(pt);
    }

    await this.updateMapLayer();

    queue.length = 0;
  }

  async cleanup() {
    await super.cleanup();

    this.viewport?.destroy();

    if (this.mapLayer)
      await this.mapLayer.cleanup();
  }
}
