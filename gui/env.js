Logger.useDefaults();

// debugging purposes:
Logger.setLevel(Logger.TRACE);
// Logger.get("gui.state").setLevel(Logger.TRACE);

const searchParams = new URLSearchParams(location.search);

GLOBAL_DEBUG_FLAG = searchParams.has("debug") ? !!eval(searchParams.get("debug")) : true;
