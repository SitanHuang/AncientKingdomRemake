
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

  mapLayer;

  async begin({ gamestate, mapObj }) {
    await super.begin();

    this.gamestate = gamestate;
    this.mapObj = mapObj;

    const app = this.app;

    const viewport = this.viewport = new Viewport({ renderer: this });
    viewport.zoom = 0.2;
    viewport.applyZoom();

    app.stage.addChild(viewport.container);

    viewport.hookEvents();

    this.mapLayer = new MapLayer({ renderer: this, container: viewport.container });
    await this.mapLayer.init({ mapObj, graphicsConfig: this.graphicsConfig });

    this.mapLayer.hookEventsToViewport(viewport);

    await this.mapLayer.render();

    this.containerElement.appendChild(this.app.canvas);
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
