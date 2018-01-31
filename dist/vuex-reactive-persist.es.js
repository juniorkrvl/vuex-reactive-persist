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
function e(t, e) {
  var r = [];
  return (
    e.forEach(function(e) {
      t.hasOwnProperty(e) && r.push(t[e]);
    }),
    r
  );
}
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
  });
export default function(r) {
  var n = (r = r || {}).key || 'vuex',
    i = new t(r),
    s =
      r.filter ||
      function(t) {
        return !r.mutations || r.mutations.indexOf(t) >= 0;
      },
    a = function(t) {
      t.replaceState(Object.assign({}, t.state, i.get(n)));
    },
    u = function(t) {
      var e = i.get();
      return (r.paths || Object.keys(t.state)).filter(function(n) {
        return (
          e[n] !== t.state[n] &&
          (r.watch[n] && r.watch[n](state[n], e[n], t), !0)
        );
      });
    };
  return function(t) {
    a(t),
      r.initialized && r.initialized(t),
      i.watch(n, function() {
        u(t), a(t);
      }),
      t.subscribe(function(n, a) {
        s(n.type, payload) && u(t).length && i.set(r.paths ? e(a, r.paths) : a);
      });
  };
}
export { e as pick };
//# sourceMappingURL=vuex-reactive-persist.es.js.map
