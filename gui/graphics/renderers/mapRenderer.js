
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

  beginSelection({
    mask = null,
    callback = async () => {},
    overlay = true,

    // set to false if leaving untouched for below handlers:
    onTileTooltip = null,
    onCursorType = ([r, c]) => this.selectableMask[r][c] ? 'pointer' : 'not-allowed'
  }={}) {
    this.selectionStarted && this.endSelection();

    this.selectionStarted = true;

    mask && (this.selectableMask = mask);

    this.mapLayer.applySelectableMask(this.selectableMask);

    if (overlay)
      this.onTileHoverOverlay = ([row, col]) => !!this.selectableMask[row][col];

    if (onTileTooltip !== false)
      this.onTileTooltip = onTileTooltip;
    if (onCursorType !== false)
      this.onCursorType = onCursorType;
  }

  endSelection({
    destroyListeners=true
  }={}) {
    this.mapLayer.applySelectableMask();
    this.selectionStarted = false;

    if (destroyListeners) {
      this.onTileHoverOverlay = null;
      this.onTileTooltip = null;
    }
  }

  applyCursor(type) {
    if (!type && typeof type != 'string')
      return;

    this.containerElement.style.cursor = type;
  }

  async updateMapLayer(_intent) {
    await this.mapLayer.update(_intent);
  }

  async cleanup() {
    await super.cleanup();

    this.viewport?.destroy();

    if (this.mapLayer)
      await this.mapLayer.cleanup();
  }
}
