class GameControllerUIManager {
  gameController;

  $uiCon;
  $toolbarLeft;
  $toolbarRight;
  $leftPane;

  constructor(gc) {
    this.gameController = gc;
  }

  async init() {
    this.$uiCon = gui_get$Template('template-game-ui-container').clone().prependTo($uiLayer);
    this.$toolbarLeft = this.$uiCon.find('.top-toolbar.left');
    this.$toolbarRight = this.$uiCon.find('.top-toolbar.right');
    this.$leftPane = this.$uiCon.find('.left-pane');
  }

  async cleanup() {
    $uiLayer.html('');
  }

  async prepTurn() {
    await this.renderHeader();
  }
  async endTurn() {
    await this.resetTransientActions();
  }

  async resetTransientActions() {
    this.closeLeftPane(); // don't wait on this
  }

  async renderHeader() {
    const [ civ, gov, gs ] = [ this.currentCiv, this.currentGov, this.gameState ];

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

    gui_tooltip_set(
      this.$toolbarRight.find('.date')
        .text(gui_format_datestring(gs.currentStamp)),
      `
      <b>Turns: </b>${gs.turns}<br>
      <b>Production cycle: </b>${gs.turns % gs.turnsPerProdCycle} / ${gs.turnsPerProdCycle}
      `,
      { type: 'html' }
    );
    // TODO: show via tooltip how many cycles left

    if (!civ.spawned && gov_is_central(gov)) {
      await gui_gc_place_capital(this);
    }
  }

  async animateLeftPane({
    $child=undefined,
    title='',
    width='',
    closeable=true,
  }={}) {
    this.$leftPane.removeClass('animate-start').removeClass('animate-end').removeClass('shown');

    $child && this.$leftPane.find('.content').html('').append($child);
    this.$leftPane.css('width', width).find('.header .title').text(title);

    await gui_wrap_timeout_promise(_ => this.$leftPane.addClass('animate-start'), 0);
    this.$leftPane.addClass('shown');

    if (!closeable) {
      this.$leftPane.find('.header .close').hide();
    } else {
      this.$leftPane.find('.header .close').show()[0].onclick = () => {
        this.closeLeftPane();
      };
    }
  }

  async closeLeftPane() {
    await gui_wrap_timeout_promise(_ => this.$leftPane.addClass('animate-end'), 0);
    await gui_wrap_timeout_promise(_ => this.$leftPane.removeClass('shown'), 250);
    this.$leftPane.removeClass('animate-start').removeClass('animate-end');
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