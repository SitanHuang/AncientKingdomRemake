
async function fs_prompt_serialize_obj(obj, {
  fname = "data",
  fext  = "json",
}={}) {
  const blob = fs_serialize_obj_to_blob(obj);

  const element = document.createElement('a');
  element.setAttribute('href', URL.createObjectURL(blob));
  element.setAttribute('download', fname + '.' + fext);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);

  return true;
}
