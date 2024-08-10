
class ViewportTestRenderer extends Renderer {

  #sampleImg = 'https://upload.wikimedia.org/wikipedia/commons/7/7b/China_topography_full_res.jpg';

  async init(_intent) {
    await super.init(_intent);

    const app = this.app;

    const viewport = new Viewport({ renderer: this });

    await PIXI.Assets.load(this.#sampleImg);
    let sprite = PIXI.Sprite.from(this.#sampleImg);

    sprite.on('click', (e) => {
      document.getElementById('console').innerText +=
        `Click: ${e.nativeEvent.offsetX}\n`;
    })
    sprite.on('tap', (e) => {
      document.getElementById('console').innerText +=
        `Tap: ${e.nativeEvent}\n`;
    })
    sprite.eventMode = 'static';

    viewport.addChild(sprite);
    app.stage.addChild(viewport.container);

    // we're gonna do everything in-house
    // app.stage.eventMode = 'none';
    // start listening to mouse events
    viewport.hookEvents();

    console.log(viewport);
  }

  async cleanup() {
    await super.cleanup();
  }
}