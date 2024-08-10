
class Layer {
  renderer;
  container;

  constructor({ renderer, container }) {
    this.renderer = renderer;
    this.container = container;
  }

  async cleanup(_intent) {
    throw "Cleanup not properly implemented!";
  }

  async init(_intent) {}

  async render(_intent) {}

  async update(_intent) {}

  get cacheManager() {
    return this.renderer.cacheManager;
  }
}