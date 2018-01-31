import dotty from 'dotty';
import Storage from './storage';

export default function(options) {
  const plugin = options || {};
  plugin.storage = new Storage(plugin);

  // make options paths available
  plugin.initializeStorage = () => {
    const val = plugin.storage.getState() || {};
    (plugin.paths || []).forEach(key => {
      if (!dotty.exists(val, key)) {
        dotty.put(val, key, null);
      }
    });
    plugin.storage.setState(val);
  };

  // filters the mutation type
  plugin.filter =
    plugin.filter ||
    (x => !plugin.mutations || plugin.mutations.indexOf(x) >= 0);

  // replace the current state with new state from storage
  plugin.replaceState = () => {
    const savedState = plugin.storage.getState();
    if (!savedState) return;
    const mergedState = Object.assign({}, plugin.store.state, savedState);
    plugin.store.replaceState(mergedState);
  };

  // find changes between previous and current state and callback watches
  plugin.invokeWatchers = ({ state, reverse }) => {
    let hasChange = false;
    state = state || plugin.store.state;
    const prevState = plugin.storage.getState() || {};
    (plugin.paths || dotty.deepKeys(state)).forEach(path => {
      const stateVal = dotty.get(state, path);
      const savedVal = dotty.get(prevState, path);
      if (stateVal === savedVal) return;
      hasChange = true;
      if (plugin.watch && plugin.watch[path]) {
        plugin.watch[path](
          reverse ? savedVal : stateVal,
          reverse ? stateVal : savedVal,
          plugin.store
        );
      }
    });
    return hasChange;
  };

  return function(store) {
    plugin.store = store;
    // restore state
    plugin.replaceState();
    plugin.initializeStorage();
    plugin.initialized && plugin.initialized(store);

    // watch storage value change
    if (!plugin.watchInterval) {
      plugin.storage.on(() => {
        plugin.invokeWatchers({ reverse: true });
        plugin.replaceState();
      }, watchInterval);
    }

    store.subscribe((mutation, state) => {
      // check if mutation type should be considered
      if (!plugin.filter(mutation.type || mutation)) return;
      // find current changes
      const hasChange = plugin.invokeWatchers({ state });
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
      plugin.storage.setState(picked);
    });
  };
}
