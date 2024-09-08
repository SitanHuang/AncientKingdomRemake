function gui_forms_map_to_obj($container, obj, {
  $formObj = null, // if not null, will only commit to obj when everything is valid
  onChangeCallback = null,
} = {}) {
  const log = Logger.get("gui.formmapper");

  if (!$formObj)
    log.warn('Form Obj not present');

  $container.find('input').each(function () {
    const $input = $(this);
    const type = $input.attr('type');
    const name = $input.attr('name');

    // Handle nested properties
    const keys = name.split(':');
    let target = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }
    const key = keys[keys.length - 1];

    // Ignore keys not found in obj
    if (target[key] === undefined)
      return;

    if (type === 'color') {
      $input[0].value = '#' + target[key].toString(16).padStart(6, '0');
    } else {
      $input[0].value = target[key];
    }

    // Event listener for input changes
    $input.on('change input', function () {
      // Validate form
      if (
        ($formObj ? $formObj[0].checkValidity() : true) &&
        $input[0].checkValidity()
      ) {
        let value = $input.val();
        // Map the value to the correct type based on the input type
        switch (type) {
          case 'text':
          case 'hidden':
            target[key] = value;
            break;
          case 'color':
            target[key] = parseInt(value.replace('#', '0x'));
            break;
          case 'number':
          case 'range':
            target[key] = parseFloat(value);
            break;
          default:
            log.warn('Unsupported input type', type);
        }

        if (onChangeCallback)
          onChangeCallback($input, name, target, value);
      }
    });
  });
}
