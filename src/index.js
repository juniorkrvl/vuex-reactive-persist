import dotty from 'dotty';
import Storage from './storage';

export default function(options) {
  options = options || {};
  let { mutations, filter, paths, watch } = options;
  const storage = new Storage(options);

  // make options paths available
  function initializeStorage() {
    const val = storage.getState() || {};
    (paths || []).forEach(key => {
      if (!dotty.exists(val, key)) {
        dotty.put(val, key, null);
      }
    });
    storage.setState(val);
  }

  // filters the mutation type
  filter = filter || (x => !mutations || mutations.indexOf(x) >= 0);

  // replace the current state with new state from storage
  const replaceState = store => {
    const savedState = storage.getState();
    if (!savedState) return;
    store.replaceState(Object.assign({}, store.state, savedState));
  };

  // find changes between previous and current state and callback watches
  const invokeWatchers = (store, state, reverse = false) => {
    let hasChange = false;
    state = state || store.state;
    const prevState = storage.getState() || {};
    (paths || dotty.deepKeys(state)).forEach(path => {
      const stateVal = dotty.get(state, path);
      const savedVal = dotty.get(prevState, path);
      if (stateVal === savedVal) return;
      hasChange = true;
      if (watch && watch[path]) {
        reverse
          ? watch[path](savedVal, stateVal, store)
          : watch[path](stateVal, savedVal, store);
      }
    });
    return hasChange;
  };

  return function(store) {
    // restore state
    replaceState(store);
    initializeStorage();
    options.initialized && options.initialized(store);

    // watch storage value change
    storage.on(() => {
      invokeWatchers(store, (reverse = true));
      replaceState(store);
    });

    store.subscribe((mutation, state) => {
      // check if mutation type should be considered
      if (!filter(mutation.type || mutation)) return;
      // find current changes
      const hasChange = invokeWatchers(store, state);
      // save only on change
      if (!hasChange) return;
      let picked = state;
      if (options.paths) {
        picked = {};
        options.paths.forEach(key => {
          const val = dotty.get(state, key);
          dotty.put(picked, key, val);
        });
      }
      storage.setState(picked);
    });
  };
}
