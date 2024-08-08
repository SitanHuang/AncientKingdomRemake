class Renderer {
  containerElement;
  app;

  ticker;

  updateSequence = [];

  constructor(containerElement) {
    this.containerElement = containerElement;
  }

  addTickerSequence(func) {
    this.updateSequence.push(func);
  }

  tickerPerformUpdate(time) {
    // TODO: perform compute stats
    for (const func of this.updateSequence) {
      func(time);
    }
  }

  async begin(intent={}) {
  }

  async cleanup(intent = {}) {
    this.app.canvas.remove();
    this.app.destroy();
  }
}