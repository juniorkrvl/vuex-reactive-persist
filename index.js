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
    if (!savedState || !Object.keys(savedState).length) return;
    store.replaceState(Object.assign(store.state, savedState));
  };

  // find changes between previous and current state and callback watches
  const invokeWatchers = (store, state) => {
    let hasChange = false;
    state = state || store.state;
    const prev = storage.get(key) || {};
    const paths = options.paths || Object.keys(state);
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
      let picked = {};
      (options.paths || Object.keys(state)).forEach(key => {
        let sub = picked;
        key.split('.').forEach(x => {
          sub[x] = state[x];
          sub = sub[x];
        });
      });
      storage.set(key, picked);
    });
  };
}
