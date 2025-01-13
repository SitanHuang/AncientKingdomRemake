async function api_throw_fatal(msg, _opts={}) {
  gui_dialog_alert(msg, { status: "error" });
  throw new Error(msg);
}