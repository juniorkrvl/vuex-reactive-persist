const storage = window.localStorage

// Call every watcher that has changed values
function callWatchers(watchers, previusValue) {
  Object.keys(watchers).forEach(key => {
    if (previusValue[key] !== window.localStorage[key]) {
      watchers[key].forEach(f => f())
    }
  })
}

export default class LocalStorage {
  /**
   * Creates a new instance
   * @param {*Function} reducer Reduces the value to string
   * @param {*Function} parser Parses the value from string
   */
  constructor(reducer, parser) {
    this.reducer = reducer || (v => JSON.stringify(v))
    this.parser = parser || (v => JSON.parse(v))
    this.watchers = {}
    this.previusValue = {}
    
    // watch every 1000s
    setInterval(() => callWatchers(this.watchers, this.previusValue), 1000)
  }

  /**
   * Gets a value from local-storage by key
   * @param {*String} key Key name
   * @param {*Any} def Default value
   */
  get(key, def) {
    this.previusValue[key] = this.parser(storage[key]) || def
    return this.previusValue[key]
  }

  /**
   * Sets a value to local storage
   * @param {*String} key Key name
   * @param {*Any} val Value to store
   */
  set(key, val) {
    this.previusValue[key] = this.reducer(val)
    storage[key] = this.previusValue[key]
  }

  /**
   * Adds watcher for value change of a key
   * @param {*String} key 
   * @param {*Function} callback 
   */
  on(key, callback) {
    if (callback && callback instanceof Function) {
      this.watchers[key].push(callback)
      return true
    }
    return false
  }

  /**
   * Removes a watcher
   * @param {*String} key 
   * @param {*Function} callback 
   */
  off(key, callback) {
    const index = this.watchers[key].indexOf(callback)
    if (index < 0) return false
    this.watchers.splice(index, 1)
    return true
  }
}
