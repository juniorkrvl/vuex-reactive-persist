export default class Storage {
  constructor({ key, storage, reducer, parser }) {
    this.key = key || 'vuex';
    this.previousValue = '{}';

    this.reducer = reducer || JSON.stringify;
    this.parser = parser || JSON.parse;
    this.storage = storage || {
      getItem: k => window.localStorage[k],
      setItem: (k, v) => (window.localStorage[k] = v)
    };
  }

  getState() {
    try {
      this.previousValue = this.storage.getItem(this.key);
      return this.parser(this.previousValue);
    } catch (err) {
      return null;
    }
  }

  setState(val) {
    try {
      this.previousValue = this.reducer(val);
    } catch (err) {
    } finally {
      this.storage.setItem(this.key, this.previousValue);
    }
  }

  on(callback, interval) {
    // watch every 1000s for changed values
    setInterval(() => {
      const saved = this.storage.getItem(this.key);
      if (this.previousValue !== saved) {
        this.previousValue = saved;
        callback(this.parser(saved), this.parser(this.previousValue));
      }
    }, interval || 1000);
  }
}
