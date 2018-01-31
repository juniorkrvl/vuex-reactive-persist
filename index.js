import LocalStorage from './src/storage';
import { pick, deepCopy } from './src/utils';

export default function(options) {
  options = options || {};
  const key = options.key || 'vuex';
  const storage = new LocalStorage(options);

  // filters the mutation type
  const filter =
    options.filter ||
    (type => {
      return !options.mutations || options.mutations.indexOf(type) >= 0;
    });

  // replace the current state with new state from storage
  const replaceState = store => {
    const old = deepCopy(store.state);
    const current = storage.get(key);
    store.replaceState(Object.assign(old, current));
  };

  // find changes between previous and current state and callback watches
  const invokeWatchers = store => {
    const prev = storage.get();
    const paths = options.paths || Object.keys(store.state);
    return paths.filter(path => {
      if (prev[path] === store.state[path]) return false;
      options.watch[path] &&
        options.watch[path](state[path], prev[path], store);
      return true;
    });
  };

  return function(store) {
    // restore state
    replaceState(store);
    options.initialized && options.initialized(store);

    // watch storage value change
    storage.watch(key, () => {
      invokeWatchers(store);
      replaceState(store);
    });

    store.subscribe(({ type }, state) => {
      // check if mutation type should be considered
      if (!filter(type, payload)) return;
      // find current changes
      const changes = invokeWatchers(store);
      // save only on change
      if (changes.length) {
        storage.set(options.paths ? pick(state, options.paths) : state);
      }
    });
  };
}
