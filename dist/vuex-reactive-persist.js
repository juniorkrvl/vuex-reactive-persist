var t = {
    get: require('get-value'),
    set: require('set-value'),
    has: require('has-value'),
    keys: function(t, e) {
      var r = this,
        a = [];
      return (
        (e = (e && e + '.') || ''),
        Object.keys(t).forEach(function(s) {
          t[s] instanceof Object
            ? (a = a.concat(r.keys(t[s], e + s)))
            : a.push(e + s);
        }),
        a
      );
    }
  },
  e = function(t) {
    var e = t.storage,
      r = t.reducer,
      a = t.parser;
    (this.key = t.key || 'vuex'),
      (this.previousValue = '{}'),
      (this.reducer = r || JSON.stringify),
      (this.parser = a || JSON.parse),
      (this.storage = e || {
        getItem: function(t) {
          return window.localStorage[t];
        },
        setItem: function(t, e) {
          return (window.localStorage[t] = e);
        }
      });
  };
(e.prototype.getState = function() {
  try {
    return (
      (this.previousValue = this.storage.getItem(this.key)),
      this.parser(this.previousValue)
    );
  } catch (t) {
    return null;
  }
}),
  (e.prototype.setState = function(t) {
    try {
      this.previousValue = this.reducer(t);
    } catch (t) {
    } finally {
      this.storage.setItem(this.key, this.previousValue);
    }
  }),
  (e.prototype.on = function(t, e) {
    var r = this;
    setInterval(function() {
      var e = r.storage.getItem(r.key);
      r.previousValue !== e &&
        ((r.previousValue = e), t(r.parser(e), r.parser(r.previousValue)));
    }, e || 1e3);
  }),
  (module.exports = function(r) {
    return (
      ((r = r || {}).storage = new e(r)),
      (r.watchInterval = r.watchInterval || 1e3),
      (r.filter =
        r.filter ||
        function(t) {
          return !r.mutations || r.mutations.indexOf(t) >= 0;
        }),
      (r.replaceState = function() {
        var t = r.storage.getState();
        if (t) {
          var e = Object.assign({}, r.store.state, t);
          r.store.replaceState(e);
        }
      }),
      (r.storeState = function(e) {
        e = e || r.store.state;
        var a = r.paths ? {} : e;
        r.paths &&
          r.paths.forEach(function(r) {
            t.set(a, r, t.get(e, r));
          }),
          r.storage.setState(a);
      }),
      (r.invokeWatchers = function(e) {
        var a = e.state,
          s = e.reverse,
          i = !1;
        a = a || r.store.state;
        var o = r.storage.getState() || {};
        return (
          (r.paths || t.keys(a)).forEach(function(e) {
            var n = t.get(a, e),
              u = t.get(o, e);
            n !== u &&
              ((i = !0),
              t.has(r.watch, e) &&
                t.get(r.watch, e)(s ? u : n, s ? n : u, r.store));
          }),
          i
        );
      }),
      function(t) {
        (r.store = t),
          r.replaceState(),
          r.storeState(),
          r.initialized && r.initialized(t),
          r.watchInterval >= 0 &&
            r.storage.on(function() {
              r.invokeWatchers({ reverse: !0 }), r.replaceState();
            }, r.watchInterval),
          t.subscribe(function(t, e) {
            r.filter(t.type || t) &&
              r.invokeWatchers({ state: e }) &&
              r.storeState(e);
          });
      }
    );
  });
//# sourceMappingURL=vuex-reactive-persist.js.map
