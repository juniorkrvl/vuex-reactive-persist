import Storage from './storage';

export default function(options) {
  options = options || {};
  const key = options.key || 'vuex';
  const storage = new Storage(options);

  // filters the mutation type
  const filter =
    options.filter ||
    (type => !options.mutations || options.mutations.indexOf(type) >= 0);

  // replace the current state with new state from storage
  const replaceState = store => {
    const savedState = storage.get(key);
    if (!savedState) return;
    store.replaceState(Object.assign({}, store.state, savedState));
  };

  // find changes between previous and current state and callback watches
  const invokeWatchers = (store, state) => {
    let hasChange = false;
    state = state || store.state;
    const prev = storage.get(key) || {};
    const paths = options.paths || Object.keys(store.state);
    paths.forEach(path => {
      if (prev[path] === state[path]) return;
      hasChange = true;
      if (options.watch && options.watch[path]) {
        options.watch[path](state[path], prev[path], store);
      }
    });
    return hasChange;
  };

  return function(store) {
    // restore state
    replaceState(store);
    options.initialized && options.initialized(store);

    // watch storage value change
    storage.on(key, () => {
      invokeWatchers(store);
      replaceState(store);
    });

    store.subscribe(({ type, payload }, state) => {
      // check if mutation type should be considered
      if (!filter(type, payload)) return;
      // find current changes
      const hasChange = invokeWatchers(store, state);
      // save only on change
      if (!hasChange) return;
      let picked = pick(state, options.paths);
      storage.set(key, picked);
    });
  };
}

/**
 * Pick all values specified by te paths and returns an array
 * @param {*Object} object Object to use
 * @param {*Array} paths List of paths to pick
 */
export function pick(object, paths) {
  if (!paths || !object) return object;
  let picked = {};
  paths.forEach(key => (picked[key] = object[key]));
  return picked;
}
