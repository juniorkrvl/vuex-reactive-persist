!(function(t, e) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = e())
    : 'function' == typeof define && define.amd
      ? define(e)
      : (t.reactivePersistedState = e());
})(this, function() {
  var t = function(t) {
    var e = t.storage,
      r = t.parser;
    (this.reducer =
      t.reducer ||
      function(t) {
        return JSON.stringify(t || '');
      }),
      (this.parser =
        r ||
        function(t) {
          return JSON.parse(t || '');
        }),
      (this.previusValue = {}),
      (this.watchers = {}),
      (this.storage = e || {
        getItem: function(t) {
          return window.localStorage[t];
        },
        setItem: function(t, e) {
          return (window.localStorage[t] = e);
        }
      }),
      setInterval(this._callWatchers, 1e3);
  };
  return (
    (t.prototype._callWatchers = function() {
      var t = this;
      Object.keys(this.watchers).forEach(function(e) {
        t.previusValue[e] !== t.storage.getItem(e) &&
          t.watchers[e].forEach(function(t) {
            return t();
          });
      });
    }),
    (t.prototype.get = function(t) {
      try {
        var e = this.parser(this.storage.getItem(t));
        this.previusValue[t] = e || this.previusValue[t];
      } finally {
        return this.previusValue[t];
      }
    }),
    (t.prototype.set = function(t, e) {
      try {
        (this.previusValue[t] = this.reducer(e)),
          this.storage.setItem(t, this.previusValue[t]);
      } finally {
      }
    }),
    (t.prototype.on = function(t, e) {
      return (
        !!(e && e instanceof Function) &&
        ((this.watchers[t] = this.watchers[t] || []),
        this.watchers[t].push(e),
        !0)
      );
    }),
    (t.prototype.off = function(t, e) {
      var r = this.watchers[t].indexOf(e);
      return !(r < 0) && (this.watchers.splice(r, 1), !0);
    }),
    function(e) {
      var r = (e = e || {}).key || 'vuex',
        n = new t(e),
        i =
          e.filter ||
          function(t) {
            return !e.mutations || e.mutations.indexOf(t) >= 0;
          },
        s = function(t) {
          var e = n.get(r);
          e && t.replaceState(Object.assign({}, t.state, e));
        },
        a = function(t, r) {
          var i = !1;
          r = r || t.state;
          var s = n.get() || {};
          return (
            (e.paths || Object.keys(t.state)).forEach(function(n) {
              s[n] !== r[n] &&
                ((i = !0), e.watch && e.watch[n] && e.watch[n](r[n], s[n], t));
            }),
            i
          );
        };
      return function(t) {
        s(t),
          e.initialized && e.initialized(t),
          n.on(r, function() {
            a(t), s(t);
          }),
          t.subscribe(function(s, o) {
            i(s.type, s.payload) &&
              a(t, o) &&
              n.set(
                r,
                e.paths
                  ? (function(t, e) {
                      if (!t) return {};
                      var r = {};
                      return (
                        e.forEach(function(e) {
                          t.hasOwnProperty(e) && (r[e] = t[e]);
                        }),
                        r
                      );
                    })(o, e.paths)
                  : o
              );
          });
      };
    }
  );
});
//# sourceMappingURL=vuex-reactive-persist.umd.js.map
