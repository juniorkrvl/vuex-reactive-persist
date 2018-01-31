import getValue from 'get-value';
import setValue from 'set-value';
import Storage from './storage';

export default function(opt) {
  opt = opt || {};
  opt.storage = new Storage(opt);
  opt.watchInterval = opt.watchInterval || 1000;

  // filters the mutation type
  opt.filter =
    opt.filter ||
    function(type) {
      if (!opt.watch) return false;
      if (Array.isArray(opt.watch)) {
        return opt.watch.indexOf(type) < 0;
      }
      return !(type in opt.watch);
    };

  // replace the current state with new state from storage
  opt.replaceState = () => {
    const savedState = opt.storage.getState();
    if (!savedState) return;
    const mergedState = Object.assign({}, opt.store.state, savedState);
    opt.store.replaceState(mergedState);
  };

  // stores the current state
  opt.storeState = state => {
    state = state || opt.store.state;
    let picked = state;
    if (opt.paths) {
      picked = {};
      opt.paths &&
        opt.paths.forEach(path => {
          setValue(picked, path, getValue(state, path));
        });
    }
    opt.storage.setState(picked);
  };

  return function(store) {
    opt.store = store;
    // restore state
    opt.replaceState();
    opt.storeState();
    opt.initialized && opt.initialized(store);

    // watch storage value change
    if (opt.watchInterval >= 0) {
      opt.storage.on(opt.replaceState, opt.watchInterval);
    }

    store.subscribe((mutation, state) => {
      const type = mutation.type || mutation;
      if (opt.filter(type)) return;
      if (opt.watch && !Array.isArray(opt.watch)) {
        opt.watch[type] && opt.watch[type](store, state);
      }
      opt.storeState(state);
    });
  };
}
