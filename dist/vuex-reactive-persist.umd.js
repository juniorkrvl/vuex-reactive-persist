!(function(e, t) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
      ? define(t)
      : (e.reactivePersist = t());
})(this, function() {
  var e = {
      get: require('get-value'),
      set: require('set-value'),
      has: require('has-value'),
      keys: function(e, t) {
        var r = this,
          a = [];
        return (
          (t = (t && t + '.') || ''),
          Object.keys(e).forEach(function(s) {
            e[s] instanceof Object
              ? (a = a.concat(r.keys(e[s], t + s)))
              : a.push(t + s);
          }),
          a
        );
      }
    },
    t = function(e) {
      var t = e.storage,
        r = e.reducer,
        a = e.parser;
      (this.key = e.key || 'vuex'),
        (this.previousValue = '{}'),
        (this.reducer = r || JSON.stringify),
        (this.parser = a || JSON.parse),
        (this.storage = t || {
          getItem: function(e) {
            return window.localStorage[e];
          },
          setItem: function(e, t) {
            return (window.localStorage[e] = t);
          }
        });
    };
  return (
    (t.prototype.getState = function() {
      try {
        return (
          (this.previousValue = this.storage.getItem(this.key)),
          this.parser(this.previousValue)
        );
      } catch (e) {
        return null;
      }
    }),
    (t.prototype.setState = function(e) {
      try {
        this.previousValue = this.reducer(e);
      } catch (e) {
      } finally {
        this.storage.setItem(this.key, this.previousValue);
      }
    }),
    (t.prototype.on = function(e, t) {
      var r = this;
      setInterval(function() {
        var t = r.storage.getItem(r.key);
        r.previousValue !== t &&
          ((r.previousValue = t), e(r.parser(t), r.parser(r.previousValue)));
      }, t || 1e3);
    }),
    function(r) {
      return (
        ((r = r || {}).storage = new t(r)),
        (r.watchInterval = r.watchInterval || 1e3),
        (r.filter =
          r.filter ||
          function(e) {
            return !r.mutations || r.mutations.indexOf(e) >= 0;
          }),
        (r.replaceState = function() {
          var e = r.storage.getState();
          if (e) {
            var t = Object.assign({}, r.store.state, e);
            r.store.replaceState(t);
          }
        }),
        (r.storeState = function(t) {
          t = t || r.store.state;
          var a = r.paths ? {} : t;
          r.paths &&
            r.paths.forEach(function(r) {
              e.set(a, r, e.get(t, r));
            }),
            r.storage.setState(a);
        }),
        (r.invokeWatchers = function(t) {
          var a = t.state,
            s = t.reverse,
            i = !1;
          a = a || r.store.state;
          var n = r.storage.getState() || {};
          return (
            (r.paths || e.keys(a)).forEach(function(t) {
              var o = e.get(a, t),
                u = e.get(n, t);
              o !== u &&
                ((i = !0),
                e.has(r.watch, t) &&
                  e.get(r.watch, t)(s ? u : o, s ? o : u, r.store));
            }),
            i
          );
        }),
        function(e) {
          (r.store = e),
            r.replaceState(),
            r.storeState(),
            r.initialized && r.initialized(e),
            r.watchInterval >= 0 &&
              r.storage.on(function() {
                r.invokeWatchers({ reverse: !0 }), r.replaceState();
              }, r.watchInterval),
            e.subscribe(function(e, t) {
              r.filter(e.type || e) &&
                r.invokeWatchers({ state: t }) &&
                r.storeState(t);
            });
        }
      );
    }
  );
});
//# sourceMappingURL=vuex-reactive-persist.umd.js.map
