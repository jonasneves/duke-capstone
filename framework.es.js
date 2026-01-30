import J, { useCallback as T, useState as I, useEffect as F, forwardRef as fe, createElement as K, useRef as he, Component as ye } from "react";
const oe = (r) => {
  let t;
  const o = /* @__PURE__ */ new Set(), i = (d, y) => {
    const b = typeof d == "function" ? d(t) : d;
    if (!Object.is(b, t)) {
      const j = t;
      t = y ?? (typeof b != "object" || b === null) ? b : Object.assign({}, t, b), o.forEach((k) => k(t, j));
    }
  }, n = () => t, c = { setState: i, getState: n, getInitialState: () => u, subscribe: (d) => (o.add(d), () => o.delete(d)) }, u = t = r(i, n, c);
  return c;
}, xe = ((r) => r ? oe(r) : oe), ve = (r) => r;
function be(r, t = ve) {
  const o = J.useSyncExternalStore(
    r.subscribe,
    J.useCallback(() => t(r.getState()), [r, t]),
    J.useCallback(() => t(r.getInitialState()), [r, t])
  );
  return J.useDebugValue(o), o;
}
const ae = (r) => {
  const t = xe(r), o = (i) => be(t, i);
  return Object.assign(o, t), o;
}, Q = ((r) => r ? ae(r) : ae);
function je(r, t) {
  let o;
  try {
    o = r();
  } catch {
    return;
  }
  return {
    getItem: (n) => {
      var s;
      const l = (u) => u === null ? null : JSON.parse(u, void 0), c = (s = o.getItem(n)) != null ? s : null;
      return c instanceof Promise ? c.then(l) : l(c);
    },
    setItem: (n, s) => o.setItem(n, JSON.stringify(s, void 0)),
    removeItem: (n) => o.removeItem(n)
  };
}
const Z = (r) => (t) => {
  try {
    const o = r(t);
    return o instanceof Promise ? o : {
      then(i) {
        return Z(i)(o);
      },
      catch(i) {
        return this;
      }
    };
  } catch (o) {
    return {
      then(i) {
        return this;
      },
      catch(i) {
        return Z(i)(o);
      }
    };
  }
}, we = (r, t) => (o, i, n) => {
  let s = {
    storage: je(() => localStorage),
    partialize: (g) => g,
    version: 0,
    merge: (g, R) => ({
      ...R,
      ...g
    }),
    ...t
  }, l = !1, c = 0;
  const u = /* @__PURE__ */ new Set(), d = /* @__PURE__ */ new Set();
  let y = s.storage;
  if (!y)
    return r(
      (...g) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${s.name}', the given storage is currently unavailable.`
        ), o(...g);
      },
      i,
      n
    );
  const b = () => {
    const g = s.partialize({ ...i() });
    return y.setItem(s.name, {
      state: g,
      version: s.version
    });
  }, j = n.setState;
  n.setState = (g, R) => (j(g, R), b());
  const k = r(
    (...g) => (o(...g), b()),
    i,
    n
  );
  n.getInitialState = () => k;
  let _;
  const N = () => {
    var g, R;
    if (!y) return;
    const O = ++c;
    l = !1, u.forEach((m) => {
      var p;
      return m((p = i()) != null ? p : k);
    });
    const h = ((R = s.onRehydrateStorage) == null ? void 0 : R.call(s, (g = i()) != null ? g : k)) || void 0;
    return Z(y.getItem.bind(y))(s.name).then((m) => {
      if (m)
        if (typeof m.version == "number" && m.version !== s.version) {
          if (s.migrate) {
            const p = s.migrate(
              m.state,
              m.version
            );
            return p instanceof Promise ? p.then((A) => [!0, A]) : [!0, p];
          }
          console.error(
            "State loaded from storage couldn't be migrated since no migrate function was provided"
          );
        } else
          return [!1, m.state];
      return [!1, void 0];
    }).then((m) => {
      var p;
      if (O !== c)
        return;
      const [A, L] = m;
      if (_ = s.merge(
        L,
        (p = i()) != null ? p : k
      ), o(_, !0), A)
        return b();
    }).then(() => {
      O === c && (h?.(_, void 0), _ = i(), l = !0, d.forEach((m) => m(_)));
    }).catch((m) => {
      O === c && h?.(void 0, m);
    });
  };
  return n.persist = {
    setOptions: (g) => {
      s = {
        ...s,
        ...g
      }, g.storage && (y = g.storage);
    },
    clearStorage: () => {
      y?.removeItem(s.name);
    },
    getOptions: () => s,
    rehydrate: () => N(),
    hasHydrated: () => l,
    onHydrate: (g) => (u.add(g), () => {
      u.delete(g);
    }),
    onFinishHydration: (g) => (d.add(g), () => {
      d.delete(g);
    })
  }, s.skipHydration || N(), _ || k;
}, me = we;
function Ye(r = "auth-storage") {
  return Q()(
    me(
      (t) => ({
        token: null,
        user: null,
        isAuthenticated: !1,
        setAuth: (o, i) => t({ token: o, user: i, isAuthenticated: !0 }),
        logout: () => {
          t({ token: null, user: null, isAuthenticated: !1 }), localStorage.clear(), window.location.href = "/";
        }
      }),
      {
        name: r
      }
    )
  );
}
function Ge(r = 3e5) {
  return Q()((t, o) => ({
    cacheTimeout: r,
    getCache: (i, n, s) => {
      const l = `gh_${i}_${n}_${s}`, c = localStorage.getItem(l);
      if (!c) return null;
      try {
        const u = JSON.parse(c);
        return Date.now() - u.timestamp > o().cacheTimeout ? (localStorage.removeItem(l), null) : u;
      } catch {
        return null;
      }
    },
    setCache: (i, n, s, l, c) => {
      const u = `gh_${i}_${n}_${s}`;
      try {
        localStorage.setItem(u, JSON.stringify({
          content: l,
          sha: c,
          timestamp: Date.now()
        }));
      } catch (d) {
        console.warn("Cache storage failed:", d);
      }
    },
    clearCache: (i, n) => {
      const s = `gh_${i}_${n}_`;
      Object.keys(localStorage).filter((c) => c.startsWith(s)).forEach((c) => localStorage.removeItem(c));
    },
    invalidateCache: (i, n, s) => {
      const l = `gh_${i}_${n}_${s}`;
      localStorage.removeItem(l);
    }
  }));
}
function qe(r = "analytics-storage", t = { enabled: !0, maxEvents: 100 }) {
  return Q()(
    me(
      (o, i) => ({
        events: [],
        errors: [],
        metrics: [],
        track: (n, s = {}) => {
          if (!t.enabled) return;
          const l = {
            type: n,
            data: s,
            timestamp: Date.now()
          };
          o((c) => ({
            events: [...c.events.slice(-(t.maxEvents - 1)), l]
          })), console.log("[Analytics]", n, s);
        },
        logError: (n) => {
          t.enabled && (console.error("[Analytics] Error logged:", n), o((s) => ({
            errors: [...s.errors.slice(-99), n]
          })));
        },
        trackMetric: (n, s, l, c) => {
          if (!t.enabled) return;
          const u = c ? l > c : !1, d = {
            appName: n,
            metricName: s,
            duration: l,
            timestamp: Date.now(),
            threshold: c,
            exceedsThreshold: u
          };
          u && console.warn(
            `[${n}] ${s} exceeded threshold: ${l.toFixed(2)}ms > ${c}ms`
          ), o((y) => ({
            metrics: [...y.metrics.slice(-999), d]
          }));
        },
        clearMetrics: () => o({ metrics: [] }),
        clearErrors: () => o({ errors: [] }),
        getMetricStats: (n, s) => {
          const l = i().metrics.filter(
            (d) => d.appName === n && d.metricName === s
          );
          if (l.length === 0) return null;
          const c = l.map((d) => d.duration), u = l.filter((d) => d.exceedsThreshold).length;
          return {
            count: l.length,
            average: c.reduce((d, y) => d + y, 0) / c.length,
            min: Math.min(...c),
            max: Math.max(...c),
            exceedCount: u
          };
        }
      }),
      {
        name: r,
        partialize: (o) => ({
          events: o.events.slice(-50),
          metrics: o.metrics.slice(-100),
          errors: o.errors.slice(-20)
        })
      }
    )
  );
}
function Ve(r, t) {
  return function(i, n) {
    const s = r.token, { getCache: l, setCache: c, invalidateCache: u } = t, d = `https://api.github.com/repos/${i}/${n}`, y = T((h) => btoa(unescape(encodeURIComponent(h))), []), b = T((h) => decodeURIComponent(escape(atob(h))), []), j = T(async (h, m = {}) => {
      const p = await fetch(`${d}/contents/${h}`, {
        ...m,
        headers: {
          Authorization: `Bearer ${s}`,
          Accept: "application/vnd.github.v3+json",
          ...m.headers
        }
      });
      if (!p.ok)
        throw p.status === 401 ? (r.logout(), new Error("Authentication expired")) : new Error(`Failed to ${m.method || "fetch"} ${h}: ${p.statusText}`);
      return p.json();
    }, [d, s]), k = T(async (h) => {
      const m = l(i, n, h);
      if (m)
        return {
          content: m.content,
          sha: m.sha,
          path: h
        };
      const p = await j(h), A = {
        content: b(p.content),
        sha: p.sha,
        path: p.path,
        name: p.name,
        size: p.size
      };
      return c(i, n, h, A.content, A.sha), A;
    }, [i, n, l, c, j, b]), _ = T(async (h, m, p, A) => {
      const L = await j(h, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: A || `Update ${h}`,
          content: y(m),
          sha: p
        })
      });
      return u(i, n, h), L;
    }, [i, n, j, y, u]), N = T(async (h, m, p) => j(h, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: p || `Create ${h}`,
        content: y(m)
      })
    }), [j, y]), g = T(async (h, m, p) => {
      const A = await j(h, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: p || `Delete ${h}`,
          sha: m
        })
      });
      return u(i, n, h), A;
    }, [i, n, j, u]), R = T(async (h = "") => j(h), [j]), O = T(async (h) => {
      try {
        const m = await k(`${h}/manifest.json`);
        return JSON.parse(m.content);
      } catch {
        return null;
      }
    }, [k]);
    return {
      getFile: k,
      updateFile: _,
      createFile: N,
      deleteFile: g,
      listDirectory: R,
      getManifest: O,
      encodeContent: y,
      decodeContent: b
    };
  };
}
var q = { exports: {} }, U = {};
var ie;
function Ee() {
  if (ie) return U;
  ie = 1;
  var r = /* @__PURE__ */ Symbol.for("react.transitional.element"), t = /* @__PURE__ */ Symbol.for("react.fragment");
  function o(i, n, s) {
    var l = null;
    if (s !== void 0 && (l = "" + s), n.key !== void 0 && (l = "" + n.key), "key" in n) {
      s = {};
      for (var c in n)
        c !== "key" && (s[c] = n[c]);
    } else s = n;
    return n = s.ref, {
      $$typeof: r,
      type: i,
      key: l,
      ref: n !== void 0 ? n : null,
      props: s
    };
  }
  return U.Fragment = t, U.jsx = o, U.jsxs = o, U;
}
var W = {};
var ce;
function ke() {
  return ce || (ce = 1, process.env.NODE_ENV !== "production" && (function() {
    function r(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === P ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case g:
          return "Fragment";
        case O:
          return "Profiler";
        case R:
          return "StrictMode";
        case A:
          return "Suspense";
        case L:
          return "SuspenseList";
        case C:
          return "Activity";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case N:
            return "Portal";
          case m:
            return e.displayName || "Context";
          case h:
            return (e._context.displayName || "Context") + ".Consumer";
          case p:
            var f = e.render;
            return e = e.displayName, e || (e = f.displayName || f.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case Y:
            return f = e.displayName || null, f !== null ? f : r(e.type) || "Memo";
          case x:
            f = e._payload, e = e._init;
            try {
              return r(e(f));
            } catch {
            }
        }
      return null;
    }
    function t(e) {
      return "" + e;
    }
    function o(e) {
      try {
        t(e);
        var f = !1;
      } catch {
        f = !0;
      }
      if (f) {
        f = console;
        var v = f.error, w = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return v.call(
          f,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          w
        ), t(e);
      }
    }
    function i(e) {
      if (e === g) return "<>";
      if (typeof e == "object" && e !== null && e.$$typeof === x)
        return "<...>";
      try {
        var f = r(e);
        return f ? "<" + f + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function n() {
      var e = S.A;
      return e === null ? null : e.getOwner();
    }
    function s() {
      return Error("react-stack-top-frame");
    }
    function l(e) {
      if (M.call(e, "key")) {
        var f = Object.getOwnPropertyDescriptor(e, "key").get;
        if (f && f.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function c(e, f) {
      function v() {
        ee || (ee = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          f
        ));
      }
      v.isReactWarning = !0, Object.defineProperty(e, "key", {
        get: v,
        configurable: !0
      });
    }
    function u() {
      var e = r(this.type);
      return te[e] || (te[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function d(e, f, v, w, G, V) {
      var E = v.ref;
      return e = {
        $$typeof: _,
        type: e,
        key: f,
        props: v,
        _owner: w
      }, (E !== void 0 ? E : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: u
      }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(e, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(e, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: G
      }), Object.defineProperty(e, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: V
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function y(e, f, v, w, G, V) {
      var E = f.children;
      if (E !== void 0)
        if (w)
          if (z(E)) {
            for (w = 0; w < E.length; w++)
              b(E[w]);
            Object.freeze && Object.freeze(E);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else b(E);
      if (M.call(f, "key")) {
        E = r(e);
        var D = Object.keys(f).filter(function(ge) {
          return ge !== "key";
        });
        w = 0 < D.length ? "{key: someKey, " + D.join(": ..., ") + ": ...}" : "{key: someKey}", se[E + w] || (D = 0 < D.length ? "{" + D.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          w,
          E,
          D,
          E
        ), se[E + w] = !0);
      }
      if (E = null, v !== void 0 && (o(v), E = "" + v), l(f) && (o(f.key), E = "" + f.key), "key" in f) {
        v = {};
        for (var B in f)
          B !== "key" && (v[B] = f[B]);
      } else v = f;
      return E && c(
        v,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), d(
        e,
        E,
        v,
        n(),
        G,
        V
      );
    }
    function b(e) {
      j(e) ? e._store && (e._store.validated = 1) : typeof e == "object" && e !== null && e.$$typeof === x && (e._payload.status === "fulfilled" ? j(e._payload.value) && e._payload.value._store && (e._payload.value._store.validated = 1) : e._store && (e._store.validated = 1));
    }
    function j(e) {
      return typeof e == "object" && e !== null && e.$$typeof === _;
    }
    var k = J, _ = /* @__PURE__ */ Symbol.for("react.transitional.element"), N = /* @__PURE__ */ Symbol.for("react.portal"), g = /* @__PURE__ */ Symbol.for("react.fragment"), R = /* @__PURE__ */ Symbol.for("react.strict_mode"), O = /* @__PURE__ */ Symbol.for("react.profiler"), h = /* @__PURE__ */ Symbol.for("react.consumer"), m = /* @__PURE__ */ Symbol.for("react.context"), p = /* @__PURE__ */ Symbol.for("react.forward_ref"), A = /* @__PURE__ */ Symbol.for("react.suspense"), L = /* @__PURE__ */ Symbol.for("react.suspense_list"), Y = /* @__PURE__ */ Symbol.for("react.memo"), x = /* @__PURE__ */ Symbol.for("react.lazy"), C = /* @__PURE__ */ Symbol.for("react.activity"), P = /* @__PURE__ */ Symbol.for("react.client.reference"), S = k.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, M = Object.prototype.hasOwnProperty, z = Array.isArray, $ = console.createTask ? console.createTask : function() {
      return null;
    };
    k = {
      react_stack_bottom_frame: function(e) {
        return e();
      }
    };
    var ee, te = {}, re = k.react_stack_bottom_frame.bind(
      k,
      s
    )(), ne = $(i(s)), se = {};
    W.Fragment = g, W.jsx = function(e, f, v) {
      var w = 1e4 > S.recentlyCreatedOwnerStacks++;
      return y(
        e,
        f,
        v,
        !1,
        w ? Error("react-stack-top-frame") : re,
        w ? $(i(e)) : ne
      );
    }, W.jsxs = function(e, f, v) {
      var w = 1e4 > S.recentlyCreatedOwnerStacks++;
      return y(
        e,
        f,
        v,
        !0,
        w ? Error("react-stack-top-frame") : re,
        w ? $(i(e)) : ne
      );
    };
  })()), W;
}
var le;
function _e() {
  return le || (le = 1, process.env.NODE_ENV === "production" ? q.exports = Ee() : q.exports = ke()), q.exports;
}
var a = _e();
function Be({
  children: r,
  oauthServiceUrl: t,
  onAuthChange: o,
  isAuthenticated: i
}) {
  const [n, s] = I(!0), [l, c] = I(!1);
  return F(() => {
    const u = document.createElement("script");
    return u.src = `${t}/github-auth.js?v=2`, u.integrity = "sha384-yCvoyjf6LKk2Yc6oSRenxRV0yFNdjeQ5ANuXIcRN50VoX/X8S4YJ9mU2+cT9MGW1", u.crossOrigin = "anonymous", u.async = !0, u.onload = () => {
      c(!0);
    }, u.onerror = () => {
      console.error("Failed to load OAuth script"), s(!1);
    }, document.head.appendChild(u), () => {
      document.head.removeChild(u);
    };
  }, [t]), F(() => {
    if (l)
      if (window.GitHubAuth.isAuthenticated()) {
        const u = window.GitHubAuth.getUser(), d = window.GitHubAuth.getToken();
        u && d && (o(d, u), s(!1));
      } else
        window.GitHubAuth.init({
          scope: "repo",
          onLogin: (u) => {
            const d = window.GitHubAuth.getUser();
            d && (o(u, d), s(!1));
          }
        }), s(!1);
  }, [l, o]), n ? /* @__PURE__ */ a.jsx("div", { className: "loading", children: /* @__PURE__ */ a.jsxs("div", { style: { textAlign: "center" }, children: [
    /* @__PURE__ */ a.jsx("div", { style: {
      border: "4px solid rgba(255,255,255,0.3)",
      borderRadius: "50%",
      borderTopColor: "white",
      width: "50px",
      height: "50px",
      animation: "spin 1s linear infinite",
      margin: "0 auto 20px"
    } }),
    /* @__PURE__ */ a.jsx("p", { children: "Initializing..." })
  ] }) }) : i ? /* @__PURE__ */ a.jsx(a.Fragment, { children: r }) : /* @__PURE__ */ a.jsx("div", { className: "loading", children: /* @__PURE__ */ a.jsxs("div", { style: { textAlign: "center" }, children: [
    /* @__PURE__ */ a.jsx("h2", { children: "Authentication Required" }),
    /* @__PURE__ */ a.jsx("p", { style: { marginTop: 16, marginBottom: 24, opacity: 0.9 }, children: "Please sign in with GitHub to access the gallery" }),
    /* @__PURE__ */ a.jsx(
      "button",
      {
        onClick: () => window.GitHubAuth.login(),
        style: {
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "500",
          cursor: "pointer"
        },
        children: "Sign in with GitHub"
      }
    )
  ] }) });
}
const pe = (...r) => r.filter((t, o, i) => !!t && t.trim() !== "" && i.indexOf(t) === o).join(" ").trim();
const Se = (r) => r.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const Re = (r) => r.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (t, o, i) => i ? i.toUpperCase() : o.toLowerCase()
);
const ue = (r) => {
  const t = Re(r);
  return t.charAt(0).toUpperCase() + t.slice(1);
};
var Ae = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const Ce = (r) => {
  for (const t in r)
    if (t.startsWith("aria-") || t === "role" || t === "title")
      return !0;
  return !1;
};
const Te = fe(
  ({
    color: r = "currentColor",
    size: t = 24,
    strokeWidth: o = 2,
    absoluteStrokeWidth: i,
    className: n = "",
    children: s,
    iconNode: l,
    ...c
  }, u) => K(
    "svg",
    {
      ref: u,
      ...Ae,
      width: t,
      height: t,
      stroke: r,
      strokeWidth: i ? Number(o) * 24 / Number(t) : o,
      className: pe("lucide", n),
      ...!s && !Ce(c) && { "aria-hidden": "true" },
      ...c
    },
    [
      ...l.map(([d, y]) => K(d, y)),
      ...Array.isArray(s) ? s : [s]
    ]
  )
);
const H = (r, t) => {
  const o = fe(
    ({ className: i, ...n }, s) => K(Te, {
      ref: s,
      iconNode: t,
      className: pe(
        `lucide-${Se(ue(r))}`,
        `lucide-${r}`,
        i
      ),
      ...n
    })
  );
  return o.displayName = ue(r), o;
};
const Ne = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
], Oe = H("arrow-right", Ne);
const $e = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
], Ie = H("circle-alert", $e);
const Pe = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
], Le = H("log-out", Pe);
const Me = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
], ze = H("refresh-cw", Me);
const De = [
  [
    "path",
    {
      d: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z",
      key: "m3kijz"
    }
  ],
  [
    "path",
    {
      d: "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z",
      key: "1fmvmk"
    }
  ],
  ["path", { d: "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0", key: "1f8sc4" }],
  ["path", { d: "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5", key: "qeys4" }]
], de = H("rocket", De);
const Fe = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
], He = H("trash-2", Fe);
function X({ user: r, onLogout: t, onClearCache: o }) {
  const [i, n] = I(!1), s = he(null);
  F(() => {
    function c(u) {
      s.current && !s.current.contains(u.target) && n(!1);
    }
    return document.addEventListener("click", c), () => document.removeEventListener("click", c);
  }, []);
  const l = () => {
    confirm("Clear all cached data? Apps will reload from the repository.") && (o(), window.location.reload());
  };
  return r ? /* @__PURE__ */ a.jsxs("div", { ref: s, style: { position: "relative" }, children: [
    /* @__PURE__ */ a.jsxs(
      "div",
      {
        className: "user-pill",
        onClick: () => n(!i),
        children: [
          /* @__PURE__ */ a.jsx(
            "img",
            {
              src: r.avatar_url,
              alt: r.login,
              className: "user-avatar"
            }
          ),
          /* @__PURE__ */ a.jsx("span", { style: { fontWeight: 500, fontSize: "14px" }, children: r.name || r.login })
        ]
      }
    ),
    /* @__PURE__ */ a.jsxs("div", { className: `user-menu ${i ? "show" : ""}`, children: [
      /* @__PURE__ */ a.jsxs("button", { onClick: () => window.location.reload(), children: [
        /* @__PURE__ */ a.jsx(ze, { size: 16 }),
        " Refresh"
      ] }),
      /* @__PURE__ */ a.jsxs("button", { onClick: l, children: [
        /* @__PURE__ */ a.jsx(He, { size: 16 }),
        " Clear Cache"
      ] }),
      /* @__PURE__ */ a.jsxs("button", { onClick: t, children: [
        /* @__PURE__ */ a.jsx(Le, { size: 16 }),
        " Logout"
      ] })
    ] })
  ] }) : null;
}
function Ue(r, t) {
  if (!r?.minLauncherVersion || !t) return null;
  const o = t.split(".").map(Number), i = r.minLauncherVersion.split(".").map(Number);
  for (let n = 0; n < 3; n++) {
    if (o[n] < i[n])
      return `Requires launcher v${r.minLauncherVersion}`;
    if (o[n] > i[n]) return null;
  }
  return null;
}
function We({ appName: r, manifest: t, path: o, onLaunch: i, version: n }) {
  if (!t)
    return /* @__PURE__ */ a.jsx("div", { className: "app-card", children: /* @__PURE__ */ a.jsxs("div", { className: "app-card-body", children: [
      /* @__PURE__ */ a.jsx("h3", { children: r }),
      /* @__PURE__ */ a.jsx("p", { style: { color: "#ccc" }, children: "Loading..." })
    ] }) });
  const s = Ue(t, n);
  return /* @__PURE__ */ a.jsxs("div", { className: "app-card", children: [
    t.thumbnail && /* @__PURE__ */ a.jsx(
      "img",
      {
        src: t.thumbnail,
        alt: t.name,
        onError: (l) => {
          l.currentTarget.style.display = "none";
        }
      }
    ),
    /* @__PURE__ */ a.jsxs("div", { className: "app-card-body", children: [
      /* @__PURE__ */ a.jsx("h3", { children: t.name }),
      /* @__PURE__ */ a.jsx("p", { children: t.description }),
      s && /* @__PURE__ */ a.jsxs("div", { style: {
        color: "#f59e0b",
        fontSize: "13px",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }, children: [
        /* @__PURE__ */ a.jsx(Ie, { size: 16 }),
        " ",
        s
      ] }),
      t.tech && t.tech.length > 0 && /* @__PURE__ */ a.jsx("div", { className: "app-meta", children: t.tech.map((l) => /* @__PURE__ */ a.jsx("span", { className: "badge", children: l }, l)) }),
      /* @__PURE__ */ a.jsxs(
        "button",
        {
          onClick: () => i(o, t.name),
          className: "launch-btn",
          children: [
            "Launch App ",
            /* @__PURE__ */ a.jsx(Oe, { size: 16 })
          ]
        }
      )
    ] })
  ] });
}
function Xe({
  config: r,
  user: t,
  token: o,
  useGitHubAPI: i,
  onLogout: n,
  onClearCache: s,
  onTrack: l,
  onNavigate: c
}) {
  const [u, d] = I([]), [y, b] = I(!0), [j, k] = I(null), [_, N] = I(null), [g, R] = I(!1), [O, h] = I(!1), m = i(r.repository.owner, r.repository.name), p = he(null);
  F(() => {
    A();
  }, []), F(() => {
    function x(C) {
      C.key === "Escape" && _ && Y();
    }
    return window.addEventListener("keydown", x), () => window.removeEventListener("keydown", x);
  }, [_]), F(() => {
    function x(C) {
      C.data === "close-app" && Y();
    }
    return window.addEventListener("message", x), () => window.removeEventListener("message", x);
  }, []);
  const A = async () => {
    try {
      b(!0);
      const C = (await m.listDirectory("apps")).filter((S) => S.type === "dir"), P = C.map((S) => ({
        name: S.name,
        path: S.path,
        manifest: null
      }));
      d(P);
      for (let S = 0; S < C.length; S++) {
        await new Promise((z) => setTimeout(z, S * 100));
        const M = await m.getManifest(C[S].path);
        M && d((z) => z.map(
          ($) => $.name === C[S].name ? { ...$, manifest: M } : $
        ));
      }
      b(!1);
    } catch (x) {
      k(x.message), b(!1);
    }
  }, L = T(async (x, C) => {
    try {
      R(!0), l?.("app_launch", { appName: C, appPath: x });
      const P = u.find(($) => $.path === x)?.manifest;
      if (P?.reactRoute && c) {
        c(P.reactRoute), R(!1);
        return;
      }
      N({ path: x, name: C });
      const S = await m.getFile(`${x}/index.html`), M = `<script>
        window.INJECTED_TOKEN = ${JSON.stringify(o)};
        window.INJECTED_USER = ${JSON.stringify(t)};
        window.PARENT_REPO = window.parent.repo;
      <\/script>`, z = S.content.replace("<head>", "<head>" + M);
      p.current && (p.current.srcdoc = z, p.current.onload = () => {
        R(!1), h(!0), setTimeout(() => h(!1), 3e3);
      });
    } catch (P) {
      alert(`Error loading app: ${P.message}`), R(!1), N(null);
    }
  }, [m, o, t, l, u, c]), Y = T(() => {
    N(null), h(!1), p.current && (p.current.srcdoc = "");
  }, []);
  return y && u.length === 0 ? /* @__PURE__ */ a.jsxs("div", { children: [
    /* @__PURE__ */ a.jsx(X, { user: t, onLogout: n, onClearCache: s }),
    /* @__PURE__ */ a.jsxs("div", { style: {
      background: `linear-gradient(135deg, ${r.branding.theme.primary} 0%, ${r.branding.theme.secondary} 100%)`,
      color: "white",
      padding: "48px 20px",
      textAlign: "center",
      marginBottom: "48px"
    }, children: [
      /* @__PURE__ */ a.jsxs("h1", { style: {
        margin: "0 0 8px 0",
        fontSize: "2.5em",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }, children: [
        /* @__PURE__ */ a.jsx(de, { size: 32 }),
        " ",
        r.branding.title
      ] }),
      /* @__PURE__ */ a.jsx("p", { style: { margin: 0, opacity: 0.95, fontSize: "1.05em" }, children: r.branding.subtitle })
    ] }),
    /* @__PURE__ */ a.jsx("div", { className: "loading", children: /* @__PURE__ */ a.jsxs("div", { style: { textAlign: "center" }, children: [
      /* @__PURE__ */ a.jsx("div", { style: {
        border: "4px solid rgba(255,255,255,0.3)",
        borderRadius: "50%",
        borderTopColor: "white",
        width: "50px",
        height: "50px",
        animation: "spin 1s linear infinite",
        margin: "0 auto 20px"
      } }),
      /* @__PURE__ */ a.jsx("p", { children: "Loading applications..." })
    ] }) })
  ] }) : j ? /* @__PURE__ */ a.jsxs("div", { children: [
    /* @__PURE__ */ a.jsx(X, { user: t, onLogout: n, onClearCache: s }),
    /* @__PURE__ */ a.jsxs("div", { className: "error", children: [
      /* @__PURE__ */ a.jsx("strong", { children: "Error:" }),
      " ",
      j
    ] })
  ] }) : /* @__PURE__ */ a.jsxs("div", { children: [
    /* @__PURE__ */ a.jsx(X, { user: t, onLogout: n, onClearCache: s }),
    /* @__PURE__ */ a.jsxs("div", { style: {
      background: `linear-gradient(135deg, ${r.branding.theme.primary} 0%, ${r.branding.theme.secondary} 100%)`,
      color: "white",
      padding: "48px 20px",
      textAlign: "center",
      marginBottom: "48px"
    }, children: [
      /* @__PURE__ */ a.jsxs("h1", { style: {
        margin: "0 0 8px 0",
        fontSize: "2.5em",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }, children: [
        /* @__PURE__ */ a.jsx(de, { size: 32 }),
        " ",
        r.branding.title
      ] }),
      /* @__PURE__ */ a.jsx("p", { style: { margin: 0, opacity: 0.95, fontSize: "1.05em" }, children: r.branding.subtitle })
    ] }),
    /* @__PURE__ */ a.jsx("div", { className: "app-grid", children: u.map((x) => /* @__PURE__ */ a.jsx(
      We,
      {
        appName: x.name,
        manifest: x.manifest,
        path: x.path,
        onLaunch: L
      },
      x.name
    )) }),
    _ && /* @__PURE__ */ a.jsxs(a.Fragment, { children: [
      /* @__PURE__ */ a.jsx(
        "iframe",
        {
          ref: p,
          className: "app-frame",
          style: { display: "block" },
          title: _.name
        }
      ),
      g && /* @__PURE__ */ a.jsx("div", { className: "app-loader", style: { display: "flex" }, children: /* @__PURE__ */ a.jsxs("div", { style: { textAlign: "center" }, children: [
        /* @__PURE__ */ a.jsx("div", { style: {
          border: "4px solid rgba(255,255,255,0.3)",
          borderRadius: "50%",
          borderTopColor: "white",
          width: "50px",
          height: "50px",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        } }),
        /* @__PURE__ */ a.jsx("p", { children: "Loading app..." })
      ] }) }),
      /* @__PURE__ */ a.jsx("div", { className: `hint ${O ? "visible" : ""}`, children: "Press ESC to return to gallery" })
    ] })
  ] });
}
class Ke extends ye {
  constructor(t) {
    super(t), this.state = { hasError: !1, error: null };
  }
  static getDerivedStateFromError(t) {
    return { hasError: !0, error: t };
  }
  componentDidCatch(t, o) {
    const i = {
      message: t.message,
      stack: t.stack,
      componentStack: o.componentStack || void 0,
      timestamp: Date.now(),
      appName: this.props.appName
    };
    this.props.onError && this.props.onError(i), console.error("[ErrorBoundary] Caught error:", i);
  }
  render() {
    return this.state.hasError ? this.props.fallback ? this.props.fallback : /* @__PURE__ */ a.jsxs("div", { style: {
      padding: "40px 20px",
      textAlign: "center",
      color: "#ef4444",
      background: "#fef2f2",
      borderRadius: "8px",
      margin: "20px"
    }, children: [
      /* @__PURE__ */ a.jsx("h2", { style: { margin: "0 0 12px", fontSize: "1.25rem", fontWeight: 600 }, children: "Something went wrong" }),
      /* @__PURE__ */ a.jsx("p", { style: { margin: "0 0 16px", color: "#991b1b", fontSize: "0.875rem" }, children: this.state.error?.message || "An unexpected error occurred" }),
      /* @__PURE__ */ a.jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          style: {
            padding: "8px 16px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500
          },
          children: "Reload Page"
        }
      )
    ] }) : this.props.children;
  }
}
export {
  We as AppCard,
  Xe as AppShell,
  Ke as ErrorBoundary,
  Be as OAuth,
  X as UserMenu,
  qe as createAnalyticsStore,
  Ye as createAuthStore,
  Ge as createCacheStore,
  Ve as createGitHubAPIHook
};
//# sourceMappingURL=framework.es.js.map
