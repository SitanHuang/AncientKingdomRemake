
function fs_prompt_load_obj({
  fext = "json",
} = {}) {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => {
      const file = e.target.files[0];

      if (!file) {
        resolve(false);
        return;
      }

      fs_deserialize_file_to_obj(file)
        .then(resolve)
        .catch(reject);
    }

    input.click();
  });
}
