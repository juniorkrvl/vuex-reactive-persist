import dotty from 'dotty';

export default class Storage {
  constructor({ key, storage, reducer, parser, disableWatch }) {
    this.key = key || 'vuex';
    this.previousValue = '';
    this.watchers = [];

    this.reducer = reducer || JSON.stringify;
    this.parser = parser || JSON.parse;
    this.storage = storage || {
      getItem: k => window.localStorage[k],
      setItem: (k, v) => window.localStorage[k] = v
    };

    // watch every 1000s for changed values
    if (disableWatch) {
      setInterval(() => {
        if (this.previousValue !== this.storage.get(this.key)) {
          this.watchers.forEach(f => f());
        }
      }, 1000);
    }
  }

  getState() {
    try {
      this.previousValue = this.storage.getItem(this.key);
      return this.parser(this.previousValue);
    } catch (err) {
      this.storage.setItem(this.key, '');
      return null;
    }
  }

  setState(val) {
    try {
      this.previousValue = this.reducer(val);
    } finally {
      this.storage.setItem(this.key, this.previousValue);
    }
  }

  on(callback) {
    if (callback && callback instanceof Function) {
      this.watchers.push(callback)
      return true
    }
    return false
  }

  off(callback) {
    const index = this.watchers.indexOf(callback)
    if (index < 0) return false
    this.watchers.splice(index, 1)
    return true
  }
}
