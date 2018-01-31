export default class Storage {
  /**
   * Creates a new instance of Storage
   * @param {*Object} options {
   *    storage: Use custom storage. Must have get/set methods accepting key as parameter.
   *    reducer: Reduces the value to string,
   *    parser: Parses the value from string
   * }
   */
  constructor({ storage, reducer, parser }) {
    this.reducer = reducer || (v => JSON.stringify(v || ''));
    this.parser = parser || (v => JSON.parse(v || ''));
    this.previusValue = {};
    this.watchers = {};

    this.storage = storage || {
      getItem: key => window.localStorage[key],
      setItem: (key, val) => (window.localStorage[key] = val)
    };

    // watch every 1000s
    setInterval(this._callWatchers, 1000);
  }

  // Call every watcher that has changed values
  _callWatchers() {
    Object.keys(this.watchers).forEach(key => {
      if (this.previusValue[key] !== this.storage.getItem(key)) {
        this.watchers[key].forEach(f => f());
      }
    });
  }

  /**
   * Gets a value from local-storage by key
   * @param {*String} key Key name
   * @param {*Any} def Default value
   */
  get(key) {
    const val = this.parser(this.storage.getItem(key));
    this.previusValue[key] = val || this.previusValue[key];
    return this.previusValue[key];
  }

  /**
   * Sets a value to local storage
   * @param {*String} key Key name
   * @param {*Any} val Value to store
   */
  set(key, val) {
    this.previusValue[key] = this.reducer(val);
    this.storage.setItem(key, this.previusValue[key]);
  }

  /**
   * Adds watcher for value change of a key
   * @param {*String} key
   * @param {*Function} callback
   */
  on(key, callback) {
    if (callback && callback instanceof Function) {
      this.watchers[key] = this.watchers[key] || [];
      this.watchers[key].push(callback);
      return true;
    }
    return false;
  }

  /**
   * Removes a watcher
   * @param {*String} key
   * @param {*Function} callback
   */
  off(key, callback) {
    const index = this.watchers[key].indexOf(callback);
    if (index < 0) return false;
    this.watchers.splice(index, 1);
    return true;
  }
}
