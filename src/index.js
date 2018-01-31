import dot from './doto';
import Storage from './storage';

export default function(opt) {
  opt = opt || {};
  opt.storage = new Storage(opt);
  opt.watchInterval = opt.watchInterval || 1000;

  // filters the mutation type
  opt.filter =
    opt.filter || (x => !opt.mutations || opt.mutations.indexOf(x) >= 0);

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
    let picked = opt.paths ? {} : state;
    opt.paths &&
      opt.paths.forEach(path => {
        dot.set(picked, path, dot.get(state, path));
      });
    opt.storage.setState(picked);
  };

  // find changes between previous and current state and callback watches
  opt.invokeWatchers = ({ state, reverse }) => {
    let hasChange = false;
    state = state || opt.store.state;
    const prevState = opt.storage.getState() || {};
    (opt.paths || dot.keys(state)).forEach(path => {
      const stateVal = dot.get(state, path);
      const savedVal = dot.get(prevState, path);
      if (stateVal === savedVal) return;
      hasChange = true;
      if (dot.has(opt.watch, path)) {
        dot.get(opt.watch, path)(
          reverse ? savedVal : stateVal,
          reverse ? stateVal : savedVal,
          opt.store
        );
      }
    });
    return hasChange;
  };

  return function(store) {
    opt.store = store;
    // restore state
    opt.replaceState();
    opt.storeState();
    opt.initialized && opt.initialized(store);

    // watch storage value change
    if (opt.watchInterval >= 0) {
      opt.storage.on(() => {
        opt.invokeWatchers({ reverse: true });
        opt.replaceState();
      }, opt.watchInterval);
    }

    store.subscribe((mutation, state) => {
      // check if mutation type should be considered
      if (!opt.filter(mutation.type || mutation)) return;
      // find current changes
      const hasChange = opt.invokeWatchers({ state });
      // save only on change
      if (!hasChange) return;
      opt.storeState(state);
    });
  };
}
