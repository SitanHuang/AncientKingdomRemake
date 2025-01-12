class GameController {
  static #instance;

  gameState;

  renderer;
  uiManager;

  constructor() {
    if (GameController.#instance) {
      throw new Error("You can only create one instance!");
    }

    GameController.#instance = this;
    Object.defineProperty(GameController, "#instance", { configurable: false, writable: false });

    gui_state_register("gameController", this);
  }

  async init({ scenarioObj }) {
    await gui_dialog_loading_begin();

    this.gameState = await api_begin(scenarioObj);
    // from this point, this.gameState as a pointer should not be changed

    this.uiManager = new GameControllerUIManager(this);
    await this.uiManager.init();

    // start() is called after state is fully switched
  }

  async start() {
    await gui_state_dispatchEvent("beginCanvas");

    await this.prepTurn();

    await gui_dialog_loading_end();
  }

  async prepTurn() {
    await api_turn_prep_gov(this.gameState);
    await this.uiManager.prepTurn();
  }
  async endTurn() {
    await this.renderer.resetTransientActions();

    await api_turn_end_gov(this.gameState);
    await this.uiManager.endTurn();
    await this.prepTurn();
  }

  async beginCanvas() {
    const state = await gui_state_getStore();

    if (state.renderer)
      await state.renderer.cleanup();

    this.renderer = state.renderer = window.renderer = new MapRenderer($canvasContainer[0]);

    await renderer.init();
    await renderer.begin({ gamestate: this.gameState, mapObj: this.gameState.map });
  }

  async cleanup() {
    const state = await gui_state_getStore();

    if (this.renderer) {
      await renderer.cleanup();
      window.renderer = renderer = state.renderer = null;
    }

    await this.uiManager.cleanup();
    this.uiManager = null;

    this.gameState = null;
  }
}

const GameControllerSingleton = new GameController();