# vuex-reactive-persist

Persist [Vuex](http://vuex.vuejs.org/) state with [localStorage](https://developer.mozilla.org/nl/docs/Web/API/Window/localStorage) and observe changes from outside the current vue instance.

This module is helpful in case you want to retain changes to your vuex state across multiple opened tabs.

> It has some inspiration from [vuex-persistedstate](https://github.com/robinvdvleuten/vuex-persistedstate)

## Requirements

- [Vue.js](https://vuejs.org) (v2.0.0+)
- [Vuex](http://vuex.vuejs.org) (v2.0.0+)

## Installation

```bash
npm install vuex-reactive-persist --save
```

## Usage

```js
import reactivePersist from 'vuex-reactive-persist'

const store = new Vuex.Store({
  // ...
  plugins: [
    reactivePersist()
  ]
})
```

## API

### `reactivePersist([options])`

```js
const store = new Vuex.Store({
  // ...
  plugins: [
    // All options are optional
    reactivePersist({
      key: 'vuex', // The key to store the persisted state,
      disableWatch: false, // Pass `true` if you don't want your storage to be observed
                           // for value changes. The `watch` option still works.
      initialize: function(store) {
        // This is called right after the `store` is replaced with saved value
        store.dispatch('clock/start')
      },
      paths: [
        // An array of any paths to partially persist the state.
        // If no paths are given, the complete state is persisted
        'bar',
        'foo.bar'
      ],
      watch: {
        // keys of the state to watch.
        // all should have functions that accepts three params:
        //    current: the new value
        //    old: the old value
        //    store: the current store object
        bar: function(current, old, store) {
          console.log('some property has been changed!');
        },
        'foo.bar': function(current, old, store) {
          console.log(current, old)
          store.dispatch('some/action')
        }
      },
      mutations: [
        // List of mutations to monitor.
        // If `filter` method is provided this will be ignored.
        'updateBar',
        'foo/setBar'
      ],
      filter: function(mutation) {
        // A function that will be called to filter any mutations which will trigger.
        // mutations options will be ignored if this method exists
        return ['filter'].indexOf(mutation.type) >= 0
      },
      storage: {
        // Storage to store.
        // Must have getItem, setItem methods
        getItem: function (key) {
          // return item as json string
        },
        setItem: function (key, val) {
          // save json value
        }
      },
      reducer: JSON.stringify // method to convert state to string
      parser: JSON.parse // method to parse the stored value back to object
    })
  ]
})
```

### Cookie Storage

You can easily customize the storage. Following example shows a way to use cookies instead of `localStorage`:

```js
import { Store } from 'vuex'
import * as Cookies from 'js-cookie'
import reactivePersist from 'vuex-reactive-persist'

const store = new Store({
  // ...
  plugins: [
    createPersistedState({
      storage: {
        getItem: key => Cookies.get(key),
        setItem: (key, value) => Cookies.set(key, value, { expires: 3, secure: true })
      }
    })
  ]
})
```

### Session Storage

In fact, any object following the Storage protocol (`getItem`, `setItem`) could be passed:

```js
createPersistedState({ storage: window.sessionStorage })
```

This is especially useful when you are using this plugin in combination with server-side rendering, where one could pass an instance of [dom-storage](https://www.npmjs.com/package/dom-storage).

## License

MIT © [Sudipto Chandra](https://github.com/dipu-bd)
