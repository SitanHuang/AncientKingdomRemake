class GameControllerUIManager {
  gameController;

  $uiCon;
  $toolbarLeft;
  $toolbarRight;

  constructor(gc) {
    this.gameController = gc;
  }

  async init() {
    this.$uiCon = gui_get$Template('template-game-ui-container').clone().prependTo($uiLayer);
    this.$toolbarLeft = this.$uiCon.find('.top-toolbar.left');
    this.$toolbarRight = this.$uiCon.find('.top-toolbar.right');
  }

  async cleanup() {
    $uiLayer.html('');
  }

  async prepTurn() {
    await this.renderHeader();
  }
  async endTurn() {

  }

  async renderHeader() {
    const [ civ, gov ] = [ this.currentCiv, this.currentGov ];
    this.$toolbarLeft.find('.banner')
      .css('color', gui_calc_font_color(civ.color))
      .css('background-color', gui_hex_to_color(civ.color))
      .find('.civ')
        .text(civ.name)
        .parent()
      .find('.gov')
        .text(gov.name)
        .parent();

    this.$toolbarRight.find('.end-turn')[0].onclick = () => {
      this.gameController.endTurn();
    };

    this.$toolbarRight.find('.date')
      .text(gui_format_datestring(this.gameState.currentStamp));
    // TODO: show via tooltip how many cycles left
  }

  get gameState() {
    return this.gameController.gameState;
  }
  get currentCiv() {
    return this.gameController.gameState.civs[this.gameController.gameState.currentCiv];
  }
  get currentGov() {
    return this.currentCiv.govs[this.gameController.gameState.currentGov];
  }
}