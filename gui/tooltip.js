
let gui_tooltip_create;
let gui_tooltip_ele_padded_info;
let gui_tooltip_destroy;

let gui_tooltip_set;
let gui_tooltip_unset;
let gui_tooltip_autohook;

(function() {
  const TOOLTIP_LISTENER_KEY = '__tooltipListenersKey';

  let $tooltip;

  // Low-level functions: (ex. for canvas stuff)

  gui_tooltip_ele_padded_info = (info, {
    maxWidth='',
    monospace=true,
    type='text',
  }={}) => {
    return $('<div class="padded-info"></div>')
      .toggleClass('monospace', monospace)
      .css('max-width', maxWidth)
      .css('white-space', type == 'text' ? 'pre-wrap' : '')
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

  // High-level functions exposed:
  gui_tooltip_unset = ($element) => {
    const listeners = $element.data(TOOLTIP_LISTENER_KEY);

    if (listeners) {
      $element.off('mouseenter', listeners.onMouseEnter);
      $element.off('mousemove', listeners.onMouseMove);
      $element.off('mouseleave', listeners.onMouseLeave);

      $element.removeData(TOOLTIP_LISTENER_KEY);
    }
  };

  gui_tooltip_set = ($element, content, options = {}) => {
    gui_tooltip_unset($element);

    let $child =
      typeof content === 'string' || content instanceof String
        ? gui_tooltip_ele_padded_info(content, options)
        : $(content); // If it's HTML or jQuery, wrap it or use it directly.

    const onMouseEnter = function onMouseEnter(e) {
      gui_tooltip_create($child);
      gui_tooltip_move(e);
    };

    const onMouseMove = function onMouseMove(e) {
      gui_tooltip_move(e);
    };

    const onMouseLeave = function onMouseLeave() {
      gui_tooltip_destroy();
    };

    $element.on('mouseenter', onMouseEnter);
    $element.on('mousemove', onMouseMove);
    $element.on('mouseleave', onMouseLeave);

    $element.data(TOOLTIP_LISTENER_KEY, {
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
    });
  };

  gui_tooltip_autohook = ($container, defaultOptions = {}) => {
    const $itemsWithTooltip = $container.find('[data-tooltip]');

    $itemsWithTooltip.each(function () {
      const $el = $(this);
      const tooltipContent = $el.attr('data-tooltip');

      gui_tooltip_set($el, tooltipContent, defaultOptions);
    });
  };
})();
