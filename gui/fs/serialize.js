
function fs_serialize_obj_to_blob(obj) {
  const blob = new Blob([JSON.stringify(obj)], {
    type: "application/json",
  });

  return blob;
}

function fs_deserialize_file_to_obj(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();

    r.onload = e => {
      resolve(JSON.parse(e.target.result));
    };

    r.onerror = e => reject(e);

    r.readAsText(file);
  });
}