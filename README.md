# vuex-reactive-persist

Persist [Vuex](http://vuex.vuejs.org/) state with [localStorage](https://developer.mozilla.org/nl/docs/Web/API/Window/localStorage) and observe changes from outside the current vue instance.

This module is helpful in case you want pass your changed state across multiple open tabs.

> It has some inspiration from [vuex-persistedstate](https://github.com/robinvdvleuten/vuex-persistedstate)

## Requirements

- [Vue.js](https://vuejs.org) (v2.0.0+)
- [Vuex](http://vuex.vuejs.org) (v2.0.0+)

## Installation

```bash
$ npm install vuex-reactive-persist
```

## Usage

<!-- [![Edit vuex-persistedstate](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/80k4m2598?autoresize=1) -->

```js
import reactivePersist from 'vuex-reactive-persist'

const store = new Vuex.Store({
  // ...
  plugins: [reactivePersist()]
})
```

## API

### `reactivePersist([options])`

Creates a new instance of the plugin with the given options. The following options
can be provided to configure the plugin for your specific needs:

- `key <String>`: The key to store the persisted state under. (default: `vuex`)
- `paths <Array>`: An array of any paths to partially persist the state. If no paths are given, the complete state is persisted. (default: `null`)
- `storage <Object>`: Storage to store. It must have `getItem` and `setItem` methods. Defaults to localStorage.
- `filter <Function>`: A function that will be called to filter any mutations which will trigger. You can also pass `mutations` instead.
- `mutations <Array>`: List of mutations to monitor. If `filter` method is provided this will be ignored.
- `watch <Object>`: Prove keys to observe for changes. Keys should be functions that accepts three params: `stateVal`, `savedVal`, `store`.
- `initialized <Function>`: This is called right after the `store` is replaced with saved value. It provided the `store` as argument.
- `disableWatch <Boolean>`: Pass `true` if you don't want your storage to be observed for value changes. The `watch` option still works. (default: `false`)

### More on `watch` feature

The module automatically watches for changes. You can listen to them by passing keys to `watch` option. This method is called whenever the mutation updates the value or the storage observer detects changes.

Suppose you have vuex store having state like this:

```js
{
  some: 'thing',
  parent: {
    child: 'state',
    another: 'child'
  }
}
```

Watch for changes on some properties:

```js
reactivePersist({
  watch: {
    some: function(current, saved, store) {
      console.log('some property has been changed!');
    },
    'parent.child': function(current, saved, store) {
      console.log(current, saved)
      store.dispatch('action')
    }
  }
})
```

### `initialize` method


```js
reactivePersist({
  initialize: function(store) {
    store.dispatch('clock/start')
  }
})
```

## Customize Storage

You can easily customize the storage. Following example shows a way to use cookies instead of `localStorage`:

<!-- [![Edit vuex-persistedstate with js-cookie](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xl356qvvkz?autoresize=1) -->

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

Any object following the Storage protocol (`getItem`, `setItem`) could be passed:

```js
createPersistedState({ storage: window.sessionStorage })
```

This is especially useful when you are using this plugin in combination with server-side rendering, where one could pass an instance of [dom-storage](https://www.npmjs.com/package/dom-storage).

## License

MIT © [Sudipto Chandra](https://github.com/dipu-bd)
