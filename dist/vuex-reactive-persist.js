var t = function(t) {
  var e = t.parser;
  (this.reducer =
    t.reducer ||
    function(t) {
      return JSON.stringify(t);
    }),
    (this.parser =
      e ||
      function(t) {
        return JSON.parse(t);
      }),
    (this.previusValue = {}),
    (this.watchers = {}),
    (this.storage = this.storage || {
      getItem: function(t) {
        return window.localStorage[t];
      },
      setItem: function(t, e) {
        return window.localStorage[e];
      }
    }),
    setInterval(this._callWatchers, 1e3);
};
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
    var e = this.parser(this.storage.getItem(t));
    return (
      (this.previusValue[t] = e || this.previusValue[t]), this.previusValue[t]
    );
  }),
  (t.prototype.set = function(t, e) {
    (this.previusValue[t] = this.reducer(e)),
      this.storage.setItem(t, this.previusValue[t]);
  }),
  (t.prototype.on = function(t, e) {
    return !!(e && e instanceof Function) && (this.watchers[t].push(e), !0);
  }),
  (t.prototype.off = function(t, e) {
    var r = this.watchers[t].indexOf(e);
    return !(r < 0) && (this.watchers.splice(r, 1), !0);
  }),
  (module.exports = function(e) {
    var r = (e = e || {}).key || 'vuex',
      n = new t(e),
      i =
        e.filter ||
        function(t) {
          return !e.mutations || e.mutations.indexOf(t) >= 0;
        },
      s = function(t) {
        t.replaceState(Object.assign({}, t.state, n.get(r)));
      },
      a = function(t) {
        var r = n.get();
        return (e.paths || Object.keys(t.state)).filter(function(n) {
          return (
            r[n] !== t.state[n] &&
            (e.watch[n] && e.watch[n](state[n], r[n], t), !0)
          );
        });
      };
    return function(t) {
      s(t),
        e.initialized && e.initialized(t),
        n.watch(r, function() {
          a(t), s(t);
        }),
        t.subscribe(function(r, s) {
          var u, o;
          i(r.type, payload) &&
            a(t).length &&
            n.set(
              e.paths
                ? ((u = s),
                  (o = []),
                  e.paths.forEach(function(t) {
                    u.hasOwnProperty(t) && o.push(u[t]);
                  }),
                  o)
                : s
            );
        });
    };
  });
//# sourceMappingURL=vuex-reactive-persist.js.map
