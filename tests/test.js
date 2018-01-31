import Vue from 'vue';
import Vuex from 'vuex';
import Storage from 'dom-storage';
import reactivePersistedState from '../src/index';

// Do not show the production tip while running tests.
Vue.config.productionTip = false;

Vue.use(Vuex);

function later(delay) {
  return new Promise(function(resolve) {
    setTimeout(resolve, delay);
  });
}

it('can be created with the default options', () => {
  window.localStorage = new Storage();
  expect(() => reactivePersistedState()).not.toThrow();
});

it("replaces store's state and subscribes to changes when initializing", () => {
  const storage = new Storage();
  storage.setItem('vuex', JSON.stringify({ persisted: 'json' }));

  const store = new Vuex.Store({ state: { original: 'state' } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = reactivePersistedState({ storage });
  plugin(store);

  expect(store.replaceState).toBeCalledWith({
    original: 'state',
    persisted: 'json'
  });
  expect(store.subscribe).toBeCalled();
});

it('plugin options are properly configured', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const options = { storage };
  reactivePersistedState(options)(store);

  expect(options.store).toBe(store);
  expect(options.storage).not.toBeNull();
  expect(options.storage.key).toBe('vuex');
  expect(options.filter).toBeInstanceOf(Function);
  expect(options.replaceState).toBeInstanceOf(Function);
  expect(options.invokeWatchers).toBeInstanceOf(Function);
  expect(options.initializeStorage).toBeInstanceOf(Function);
});

it("does not replaces store's state when receiving invalid JSON", () => {
  const storage = new Storage();
  storage.setItem('vuex', '<invalid JSON>');

  const store = new Vuex.Store({ state: { nested: { original: 'state' } } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = reactivePersistedState({ storage });
  plugin(store);

  expect(store.replaceState).not.toBeCalled();
  expect(store.subscribe).toBeCalled();
});

it("does not replaces store's state when receiving null", () => {
  const storage = new Storage();
  storage.setItem('vuex', JSON.stringify(null));

  const store = new Vuex.Store({ state: { nested: { original: 'state' } } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = reactivePersistedState({ storage });
  plugin(store);

  expect(store.replaceState).not.toBeCalled();
  expect(store.subscribe).toBeCalled();
});

it("respects nested values when it replaces store's state on initializing", () => {
  const storage = new Storage();
  storage.setItem('vuex', JSON.stringify({ persisted: 'json' }));

  const store = new Vuex.Store({ state: { original: 'state' } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = reactivePersistedState({ storage });
  plugin(store);

  expect(store.replaceState).toBeCalledWith({
    original: 'state',
    persisted: 'json'
  });
  expect(store.subscribe).toBeCalled();
});

it('should persist the changed parial state back to serialized JSON', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = reactivePersistedState({ storage, paths: ['changed'] });
  plugin(store);

  store._subscribers[0]('mutation', { changed: 'state' });

  expect(storage.getItem('vuex')).toBe(JSON.stringify({ changed: 'state' }));
});

it('persist the changed partial state back to serialized JSON under a configured key', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = reactivePersistedState({
    storage,
    key: 'custom',
    paths: ['changed']
  });
  plugin(store);

  store._subscribers[0]('mutation', { changed: 'state' });

  expect(storage.getItem('custom')).toBe(JSON.stringify({ changed: 'state' }));
});

it('persist the changed full state back to serialized JSON when no paths are given', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = reactivePersistedState({ storage });
  plugin(store);

  store._subscribers[0]('mutation', { changed: 'state' });

  expect(storage.getItem('vuex')).toBe(JSON.stringify({ changed: 'state' }));
});

it('persist the changed partial state back to serialized JSON under a nested path', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = reactivePersistedState({
    storage,
    paths: ['foo.bar', 'bar']
  });
  plugin(store);

  store._subscribers[0]('mutation', { foo: { bar: 'baz' }, bar: 'baz' });

  expect(storage.getItem('vuex')).toBe(
    JSON.stringify({ foo: { bar: 'baz' }, bar: 'baz' })
  );
});

it('should not persist null values', () => {
  const storage = new Storage();
  const store = new Vuex.Store({
    state: { alpha: { name: null, bravo: { name: null } } }
  });

  const plugin = reactivePersistedState({
    storage,
    paths: ['alpha.name', 'alpha.bravo.name']
  });

  plugin(store);

  store._subscribers[0]('mutation', { charlie: { name: 'charlie' } });

  expect(storage.getItem('vuex')).toBe(
    JSON.stringify({ alpha: { bravo: {} } })
  );
});

it('should not merge array values when rehydrating', () => {
  const storage = new Storage();
  storage.setItem('vuex', JSON.stringify({ persisted: ['json'] }));

  const store = new Vuex.Store({ state: { persisted: ['state'] } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = reactivePersistedState({ storage });
  plugin(store);

  expect(store.replaceState).toBeCalledWith({
    persisted: ['json']
  });

  expect(store.subscribe).toBeCalled();
});

it('should not clone circular objects when rehydrating', () => {
  const circular = { foo: 'bar' };
  circular.foo = circular;

  const storage = new Storage();
  storage.setItem('vuex', JSON.stringify({ persisted: 'baz' }));

  const store = new Vuex.Store({ state: { circular } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = reactivePersistedState({ storage });
  plugin(store);

  expect(store.replaceState).toBeCalledWith({
    circular,
    persisted: 'baz'
  });

  expect(store.subscribe).toBeCalled();
});

it('filters to specific mutations with mutations', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = reactivePersistedState({
    storage,
    mutations: ['filter']
  });
  plugin(store);

  store._subscribers[0]('mutation', { changed: 'state' });

  expect(storage.getItem('vuex')).toBe('{}');

  store._subscribers[0]('filter', { changed: 'state' });

  expect(storage.getItem('vuex')).toBe(JSON.stringify({ changed: 'state' }));
});

it('filters to specific mutations using filter method', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: {} });

  const plugin = reactivePersistedState({
    storage,
    filter: mutation => ['filter'].indexOf(mutation) !== -1
  });
  plugin(store);

  store._subscribers[0]('mutation', { changed: 'state' });

  expect(storage.getItem('vuex')).toBe('{}');

  store._subscribers[0]('filter', { changed: 'state' });

  expect(storage.getItem('vuex')).toBe(JSON.stringify({ changed: 'state' }));
});

it('watched keys are being called on mutation', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: { changed: 'saved' } });

  const watchedKey = jest.fn();
  const options = {
    storage,
    watch: { changed: watchedKey }
  };
  reactivePersistedState(options)(store);

  store._subscribers[0]('mutation', { changed: 'state' });
  expect(watchedKey).toBeCalled();
});

it('watched keys are being called on manual invoke with reverse option', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: { changed: 'saved' } });

  const watchedKey = jest.fn();
  const options = {
    storage,
    watch: { changed: watchedKey }
  };
  reactivePersistedState(options)(store);

  storage.setItem('vuex', JSON.stringify({ changed: 'new' }));

  options.invokeWatchers({ reverse: true });
  expect(watchedKey).toBeCalledWith('new', 'saved', store);
});

it('watched keys are being from watcher', () => {
  const storage = new Storage();
  const store = new Vuex.Store({ state: { changed: 'saved' } });

  const watchedKey = jest.fn();
  const options = {
    storage,
    watch: { changed: watchedKey }
  };
  reactivePersistedState(options)(store);

  storage.setItem('vuex', JSON.stringify({ changed: 'new' }));

  return later(2000).then(() => {
    expect(watchedKey).toBeCalledWith('new', 'saved', store);
  });
});
