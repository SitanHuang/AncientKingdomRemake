
class ViewportTestRenderer extends Renderer {

  #sampleImg = 'https://as1.ftcdn.net/v2/jpg/01/34/36/78/1000_F_134367875_oAZagIgaJIO8jqwtP41oY245CzWOMEH0.jpg';

  async begin(_intent) {
    const app = this.app = new PIXI.Application();

    const viewport = new Viewport({ renderer: this });

    await app.init();
    app.resizeTo = this.containerElement;

    // use shared ticker for entire renderer
    this.ticker = app.ticker;
    this.ticker.add((time) => {
      this.tickerPerformUpdate(time);
    });

    await PIXI.Assets.load(this.#sampleImg);
    let sprite = PIXI.Sprite.from(this.#sampleImg);

    sprite.on('click', (e) => {
      document.getElementById('console').innerText +=
        `Click: ${e.nativeEvent}\n`;
      console.log(e);
    })
    sprite.on('tap', (e) => {
      document.getElementById('console').innerText +=
        `Tap: ${e.nativeEvent}\n`;
      console.log(e);
    })
    sprite.eventMode = 'static';

    viewport.addChild(sprite);
    app.stage.addChild(viewport.container);

    this.containerElement.appendChild(app.canvas);

    // we're gonna do everything in-house
    // app.stage.eventMode = 'none';
    // start listening to mouse events
    viewport.hookEvents();

    console.log(viewport);
  }

  async cleanup() {
    super.cleanup();
  }
}