
class MapEditorRenderer extends Renderer {

  graphicsConfig = new AKRGraphicsConfig();
  viewport;
  mapObj;

  mapLayer;

  async begin({ mapObj }) {
    await super.begin();

    this.mapObj = mapObj;

    const app = this.app;

    const viewport = this.viewport = new Viewport({ renderer: this });

    app.stage.addChild(viewport.container);

    viewport.hookEvents();

    this.mapLayer = new MapLayer({ renderer: this, container: viewport.container });
    await this.mapLayer.init({ mapObj, graphicsConfig: this.graphicsConfig });
    await this.mapLayer.render();

    this.containerElement.appendChild(this.app.canvas);
  }

  async cleanup() {
    await super.cleanup();

    if (this.mapLayer)
      await this.mapLayer.cleanup();
  }
}