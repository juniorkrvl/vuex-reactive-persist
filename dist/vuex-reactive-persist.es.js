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
function e(t, e) {
  if (!t) return {};
  var r = {};
  return (
    e.forEach(function(e) {
      t.hasOwnProperty(e) && (r[e] = t[e]);
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
      var e = i.get(n);
      e && t.replaceState(Object.assign({}, t.state, e));
    },
    u = function(t, e) {
      var n = !1;
      e = e || t.state;
      var s = i.get() || {};
      return (
        (r.paths || Object.keys(t.state)).forEach(function(i) {
          s[i] !== e[i] &&
            ((n = !0), r.watch && r.watch[i] && r.watch[i](e[i], s[i], t));
        }),
        n
      );
    };
  return function(t) {
    a(t),
      r.initialized && r.initialized(t),
      i.on(n, function() {
        u(t), a(t);
      }),
      t.subscribe(function(a, o) {
        s(a.type, a.payload) &&
          u(t, o) &&
          i.set(n, r.paths ? e(o, r.paths) : o);
      });
  };
}
export { e as pick };
//# sourceMappingURL=vuex-reactive-persist.es.js.map
