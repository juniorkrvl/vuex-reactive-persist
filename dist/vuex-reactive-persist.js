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
    console.log('>>>', t, this.storage.getItem(t));
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
  (module.exports = function(e) {
    var r = (e = e || {}).key || 'vuex',
      s = new t(e),
      n =
        e.filter ||
        function(t) {
          return !e.mutations || e.mutations.indexOf(t) >= 0;
        },
      i = function(t) {
        t.replaceState(Object.assign({}, t.state, s.get(r)));
      },
      a = function(t) {
        var r = s.get();
        return (e.paths || Object.keys(t.state)).filter(function(s) {
          return (
            r[s] !== t.state[s] &&
            (e.watch[s] && e.watch[s](state[s], r[s], t), !0)
          );
        });
      };
    return function(t) {
      i(t),
        e.initialized && e.initialized(t),
        s.on(r, function() {
          a(t), i(t);
        }),
        t.subscribe(function(r, i) {
          var o, u;
          n(r.type, payload) &&
            a(t).length &&
            s.set(
              e.paths
                ? ((o = i),
                  (u = []),
                  e.paths.forEach(function(t) {
                    o.hasOwnProperty(t) && u.push(o[t]);
                  }),
                  u)
                : i
            );
        });
    };
  });
//# sourceMappingURL=vuex-reactive-persist.js.map
