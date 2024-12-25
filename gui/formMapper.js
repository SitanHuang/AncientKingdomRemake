function gui_forms_map_to_obj($container, obj, {
  $formObj = null, // if not null, will only commit to obj when everything is valid
  onChangeCallback = null,
  datasets = {
    // key: data-dataset used in <select>
    //      [[displayText, value], ...]
  },
  autoInitCanonicalDatepicker = true,
} = {}) {
  const log = Logger.get("gui.formmapper");

  const datePicker = autoInitCanonicalDatepicker ? new CanonicalDatePicker() : null;

  if (!$formObj)
    log.warn('Form Obj not present');

  // --- Handle <input> elements ---
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
    } else if (type === 'checkbox') {
      $input[0].checked = !!target[key];
    } else if (type === 'date') {
      const d = new Date(target[key]);
      const year = d.getFullYear().toString().padStart(4, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      $input[0].value = `${year}-${month}-${day}`;
    } else if (type === 'canonical-date') {
      const d = new Date(target[key]);
      const year = d.getFullYear().toString().padStart(4, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');

      datePicker && datePicker.init([$input[0]]);

      $input[0]._CanonicalDatePicker.updateValue($input[0], `${month}/${day}/${year}`);
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
          case 'checkbox':
            target[key] = $input[0].checked;
            break;
          case 'date':
            target[key] = value ? $input[0].valueAsNumber : 0;
            break;
          case 'canonical-date':
            target[key] = value ? $input[0]._valueAsNumber : 0;
            break;
          default:
            log.warn('Unsupported input type', type);
        }

        if (onChangeCallback)
          onChangeCallback($input, name, target, value);
      }
    });
  });

  // --- Handle <select> elements ---
  $container.find('select').each(function () {
    const $select = $(this);
    const name = $select.attr('name');

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

    // Skip if the property is not in the object
    if (target[key] === undefined) {
      return;
    }

    // Populate options if data-dataset is given
    const datasetKey = $select.data('dataset');
    if (datasetKey && datasets[datasetKey]) {
      // Clear out any existing options
      $select.empty();

      // $select.append($('<option>').val('').text('Select an option...'));

      // Populate from datasets
      datasets[datasetKey].forEach(([text, val]) => {
        $select.append($('<option>').val(val).text(text));
      });
    }

    // Initialize the select value
    $select.val(target[key]);

    // Event listener for changes on <select>
    $select.on('change', function () {
      if (
        ($formObj ? $formObj[0].checkValidity() : true) &&
        $select[0].checkValidity()
      ) {
        const value = $select.val();
        target[key] = value;

        if (onChangeCallback) {
          onChangeCallback($select, name, target, value);
        }
      }
    });
  });
}
