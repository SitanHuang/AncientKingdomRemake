class Renderer {
  containerElement;
  cacheManager;
  app;

  ticker;

  updateSequence = [];

  stats = new Stats();

  constructor(containerElement) {
    this.containerElement = containerElement;
    this.cacheManager = new CacheManager();
  }

  addTickerSequence(func) {
    this.updateSequence.push(func);
  }

  tickerPerformUpdate(time) {
    this.stats.begin();
    for (const func of this.updateSequence) {
      func(time);
    }
    this.stats.end();
  }

  showStats() {
    this.stats.showPanel(2);
    this.stats.showPanel(1);
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
    this.stats.dom.style.left = null;
    this.stats.dom.style.right = 0;
    this.stats.dom.style.top = '48px';
  }

  async init(_intent={}) {
    const SCALE = 2;

    const app = this.app = new PIXI.Application();
    await app.init({
      antialias: true,
      resolution: SCALE,
    });

    app.resizeTo = this.containerElement;

    this.containerElement.style.transformOrigin = 'top left';
    this.containerElement.style.transform = `scale(${1 / SCALE})`;
    this.containerElement._transformScale = SCALE;

    // use shared ticker for entire renderer
    this.ticker = app.ticker;
    this.ticker.add((time) => {
      this.tickerPerformUpdate(time);
    });
    // this.ticker.maxFPS = GLOBAL_DEBUG_FLAG ? 60 : 0;
    this.ticker.maxFPS = 0;

    if (GLOBAL_DEBUG_FLAG) {
      this.showStats();
      window.__PIXI_DEVTOOLS__ = {
        app
      };
      window.__PIXI_APP__ = app;
    }
  }

  async begin(_intent={}) {

  }

  async cleanup(_intent = {}) {
    Logger.get("gui.graphics.renderers.renderer").info("Destroying renderer...");
    this.app.destroy(
      true, // remove canvas from DOM
      {
        children: true, // destroy children recursively
        texture: true,
        baseTexture: true,
      }
    );
    this.stats.dom.remove();
  }
}