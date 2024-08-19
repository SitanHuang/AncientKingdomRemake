
let gui_tooltip_create;
let gui_tooltip_ele_padded_info;
let gui_tooltip_destroy;

(function() {
  let $tooltip;

  gui_tooltip_ele_padded_info = (info, {
    maxWidth='',
    monospace=true,
    type='text',
  }={}) => {
    return $('<div class="padded-info"></div>')
      .toggleClass('monospace', monospace)
      .css('max-width', maxWidth)
      [type](info);
  };

  gui_tooltip_destroy = () => {
    $tooltip?.remove();
  };

  gui_tooltip_create = (child) => {
    gui_tooltip_destroy();

    $tooltip = gui_get$Template('template-tooltip-con').clone()
      .addClass('tooltip-con');

    $tooltip.append(child);

    $uiLayer.append($tooltip);

    return $tooltip;
  };

  gui_tooltip_move = ({ clientX, clientY }) => {
    const pad = 12;

    const winWidth = $(window).width();
    const winHeight = $(window).height();
    const width = $tooltip.width();
    const height = $tooltip.height();
    const clientRight = winWidth - clientX;
    const clientBot = winHeight - clientY;

    const rightLimit = clientRight < width ? width + clientRight : width;
    const botLimit = clientBot < height ? height + clientBot : height;

    const top = Math.min(winHeight - botLimit - pad, clientY + pad);
    const left = Math.min(winWidth - rightLimit - pad, clientX + pad);

    $tooltip.css('top', top).css('left', left);
  };
})();

