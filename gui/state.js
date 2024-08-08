let gui_state_register;
let gui_state_init;
let gui_state_switch;
let gui_state_stop;
// let gui_state_pause;

let gui_state_getStore;
let gui_state_dispatchEvent;
let gui_state_tryDispatchEvent;


// function gui_state_

(function() {
  const log = Logger.get("gui.state");

  const STATE_REGISTRY = new Map();
  let stateStore;
  let currentState = null;

  // public functions:

  gui_state_getStore = async function() {
    return stateStore;
  }

  gui_state_register = async function(stateName, state) {
    STATE_REGISTRY.set(stateName, state);
  };

  gui_state_init = async function(initState, intent={}) {
    stateStore = {};
    log.info("Initializing GUI with state " + initState);

    await gui_state_switch(initState, intent, null);
  };

  gui_state_switch = async function(newState, newIntent={}, stopIntent={}) {
    log.info("Switching state from " + currentState + " to " + newState);

    if (currentState)
      await gui_state_stop(stopIntent);

    await gui_state_tryDispatchEvent(newState, "init", newIntent);
    await gui_state_tryDispatchEvent(newState, "start", newIntent);

    currentState = newState;
  };

  gui_state_stop = async function(stopIntent={}) {
    await gui_state_tryDispatchEvent(currentState, "stop", stopIntent);
    await gui_state_tryDispatchEvent(currentState, "cleanup", stopIntent);
  };

  gui_state_dispatchEvent = async function(eventName, intent = {}) {
    await gui_state_tryDispatchEvent(currentState, eventName, intent);
  };

  gui_state_tryDispatchEvent = async function(state, eventName, intent = {}) {
    log.info("Dispatching event " + eventName + " to state " + state);

    const handler = STATE_REGISTRY.get(state)[eventName];
    if (handler)
      await handler(intent);
  }
})();