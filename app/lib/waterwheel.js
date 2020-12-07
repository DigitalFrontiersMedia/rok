!function (e, t) {
  "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.Waterwheel = t() : e.Waterwheel = t();
}(this, function () {
  return function (e) {
    function t(n) {
      if (r[n]) return r[n].exports;var o = r[n] = { exports: {}, id: n, loaded: !1 };return e[n].call(o.exports, o, o.exports, t), o.loaded = !0, o.exports;
    }var r = {};return t.m = e, t.c = r, t.p = "", t(0);
  }([function (e, t, r) {
    "use strict";

    function n(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function o(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !t || "object" != typeof t && "function" != typeof t ? e : t;
    }function i(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);e.prototype = Object.create(t && t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
    }var s = function () {
      function e(e, t) {
        for (var r = 0; r < t.length; r++) {
          var n = t[r];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, r, n) {
        return r && e(t.prototype, r), n && e(t, n), t;
      };
    }(),
    a = r(1),
    u = r(2),
    c = r(27),
    f = r(28),
    p = r(33),
    l = r(34),
    h = r(3);e.exports = function (e) {
      function t(e) {
        n(this, t);var r = o(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));return r.api = {}, r.oauth = new l(r.options.base, r.options.oauth), r.request = new u(e, r.oauth), r.jsonapi = new f(e, r.request), r.options.resources && Object.keys(r.options.resources).length && r.parseSwagger(r.options.resources, r.request), r;
      }return i(t, e), s(t, [{ key: "parseSwagger", value: function (e, t) {
          var r = this,
          n = new p(e).collectEntities();Object.keys(n).forEach(function (e) {
            var o = {};Object.keys(n[e].methods).forEach(function (t) {
              o[t] = { path: n[e].methods[t].path };
            }), r.api[e] = new c({ base: r.options.base, methods: o, bundle: e.indexOf(":") > -1 ? e.split(":")[1] : e, entity: e.indexOf(":") > -1 ? e.split(":")[0] : e, metadata: { requiredFields: n[e].requiredFields, properties: n[e].properties } }, t);
          });
        } }, { key: "getAvailableResources", value: function () {
          return Object.keys(this.api).sort();
        } }, { key: "populateResources", value: function (e) {
          var t = this;return this.request.issueRequest(h.get, e, !1, {}, !1, !1).then(function (e) {
            t.parseSwagger(e, t.request);
          });
        } }, { key: "fetchEmbedded", value: function (e, t) {
          var r = this;if (!e || !e.hasOwnProperty("_embedded")) return Promise.reject("This is probably not HAL+JSON");var n = !!t && (Array.isArray(t) ? t : [t]),
          o = e._embedded,
          i = Object.keys(o),
          s = [];return (n ? i.filter(function (e) {
            return n.indexOf(e.split("/").pop()) !== -1;
          }) : i).forEach(function (e) {
            o[e].forEach(function (e) {
              s.push(e._links.self.href.split(r.options.base)[1]);
            });
          }), s = Array.from(new Set(s)), Promise.all([Promise.resolve(e)].concat(s.map(function (e) {
            return r.request.issueRequest(h.get, e);
          })));
        } }]), t;
    }(a);
  }, function (e, t) {
    "use strict";

    function r(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }var n = function () {
      function e(e, t) {
        for (var r = 0; r < t.length; r++) {
          var n = t[r];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, r, n) {
        return r && e(t.prototype, r), n && e(t, n), t;
      };
    }();e.exports = function () {
      function e(t) {
        r(this, e), this.options = Object.assign({ timeout: 500, accessCheck: !0, validation: !0 }, t);
      }return n(e, [{ key: "setBase", value: function (e) {
          this.options.base = e;
        } }, { key: "getBase", value: function () {
          return this.options.base;
        } }]), e;
    }();
  }, function (e, t, r) {
    "use strict";

    function n(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function o(e, t) {
      if (!e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !t || "object" != typeof t && "function" != typeof t ? e : t;
    }function i(e, t) {
      if ("function" != typeof t && null !== t) throw new TypeError("Super expression must either be null or a function, not " + typeof t);e.prototype = Object.create(t && t.prototype, { constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 } }), t && (Object.setPrototypeOf ? Object.setPrototypeOf(e, t) : e.__proto__ = t);
    }var s = function () {
      function e(e, t) {
        for (var r = 0; r < t.length; r++) {
          var n = t[r];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, r, n) {
        return r && e(t.prototype, r), n && e(t, n), t;
      };
    }(),
    a = r(1),
    u = r(3);e.exports = function (e) {
      function t(e, i) {
        n(this, t);var s = o(this, (t.__proto__ || Object.getPrototypeOf(t)).call(this, e));return s.oauth = i, s.axios = r(4), s;
      }return i(t, e), s(t, [{ key: "issueRequest", value: function (e, t, r, n, o, i) {
          var s = this;return (this.options.accessCheck && this.options.validation ? this.oauth.getToken() : Promise.resolve()).then(function () {
            var a = { method: e, timeout: s.options.timeout, url: (i || s.options.base) + "/" + ("/" === t.charAt(0) ? t.slice(1) : t), headers: { "X-CSRF-Token": r } };return s.options.accessCheck && s.options.validation && (a.headers.Authorization = "Bearer " + s.oauth.tokenInformation.access_token), e !== u.get && r || delete a.headers["X-CSRF-Token"], n && 0 !== Object.keys(n).length && Object.keys(n).forEach(function (e) {
              a.headers[e] = n[e];
            }), o && (a.data = o), s.axios(a).then(function (e) {
              return Promise.resolve(e.data);
            })["catch"](function (e) {
              var t = new Error();return e.message && e.message.indexOf("timeout") !== -1 ? (t.message = "Timeout", t.status = 408) : (t.message = e.response ? e.response.data.message : "Unknown error.", t.status = e.response ? e.response.status : 500), Promise.reject(t);
            });
          });
        } }, { key: "getXCSRFToken", value: function () {
          var e = this;return this.csrfToken ? Promise.resolve(this.csrfToken) : new Promise(function (t, r) {
            e.axios({ method: "get", url: e.options.base + "/rest/session/token" }).then(function (r) {
              return e.csrfToken = r.data, t(r.data);
            })["catch"](function (e) {
              return r(e);
            });
          });
        } }]), t;
    }(a);
  }, function (e, t) {
    "use strict";

    e.exports = { get: "get", patch: "patch", post: "post", "delete": "delete" };
  }, function (e, t, r) {
    e.exports = r(5);
  }, function (e, t, r) {
    "use strict";

    function n(e) {
      var t = new s(e),
      r = i(s.prototype.request, t);return o.extend(r, s.prototype, t), o.extend(r, t), r;
    }var o = r(6),
    i = r(7),
    s = r(8),
    a = e.exports = n();a.Axios = s, a.create = function (e) {
      return n(e);
    }, a.all = function (e) {
      return Promise.all(e);
    }, a.spread = r(26);
  }, function (e, t, r) {
    "use strict";

    function n(e) {
      return "[object Array]" === k.call(e);
    }function o(e) {
      return "[object ArrayBuffer]" === k.call(e);
    }function i(e) {
      return "undefined" != typeof FormData && e instanceof FormData;
    }function s(e) {
      var t;return t = "undefined" != typeof ArrayBuffer && ArrayBuffer.isView ? ArrayBuffer.isView(e) : e && e.buffer && e.buffer instanceof ArrayBuffer;
    }function a(e) {
      return "string" == typeof e;
    }function u(e) {
      return "number" == typeof e;
    }function c(e) {
      return "undefined" == typeof e;
    }function f(e) {
      return null !== e && "object" == typeof e;
    }function p(e) {
      return "[object Date]" === k.call(e);
    }function l(e) {
      return "[object File]" === k.call(e);
    }function h(e) {
      return "[object Blob]" === k.call(e);
    }function d(e) {
      return "[object Function]" === k.call(e);
    }function y(e) {
      return f(e) && d(e.pipe);
    }function m(e) {
      return "undefined" != typeof URLSearchParams && e instanceof URLSearchParams;
    }function g(e) {
      return e.replace(/^\s*/, "").replace(/\s*$/, "");
    }function v() {
      return "undefined" != typeof window && "undefined" != typeof document && "function" == typeof document.createElement;
    }function b(e, t) {
      if (null !== e && "undefined" != typeof e) if ("object" == typeof e || n(e) || (e = [e]), n(e)) for (var r = 0, o = e.length; r < o; r++) t.call(null, e[r], r, e);else for (var i in e) e.hasOwnProperty(i) && t.call(null, e[i], i, e);
    }function w() {
      function e(e, r) {
        "object" == typeof t[r] && "object" == typeof e ? t[r] = w(t[r], e) : t[r] = e;
      }for (var t = {}, r = 0, n = arguments.length; r < n; r++) b(arguments[r], e);return t;
    }function j(e, t, r) {
      return b(t, function (t, n) {
        r && "function" == typeof t ? e[n] = O(t, r) : e[n] = t;
      }), e;
    }var O = r(7),
    k = Object.prototype.toString;e.exports = { isArray: n, isArrayBuffer: o, isFormData: i, isArrayBufferView: s, isString: a, isNumber: u, isObject: f, isUndefined: c, isDate: p, isFile: l, isBlob: h, isFunction: d, isStream: y, isURLSearchParams: m, isStandardBrowserEnv: v, forEach: b, merge: w, extend: j, trim: g };
  }, function (e, t) {
    "use strict";

    e.exports = function (e, t) {
      return function () {
        for (var r = new Array(arguments.length), n = 0; n < r.length; n++) r[n] = arguments[n];return e.apply(t, r);
      };
    };
  }, function (e, t, r) {
    "use strict";

    function n(e) {
      this.defaults = i.merge(o, e), this.interceptors = { request: new s(), response: new s() };
    }var o = r(9),
    i = r(6),
    s = r(11),
    a = r(12),
    u = r(24),
    c = r(25);n.prototype.request = function (e) {
      "string" == typeof e && (e = i.merge({ url: arguments[0] }, arguments[1])), e = i.merge(o, this.defaults, { method: "get" }, e), e.baseURL && !u(e.url) && (e.url = c(e.baseURL, e.url));var t = [a, void 0],
      r = Promise.resolve(e);for (this.interceptors.request.forEach(function (e) {
        t.unshift(e.fulfilled, e.rejected);
      }), this.interceptors.response.forEach(function (e) {
        t.push(e.fulfilled, e.rejected);
      }); t.length;) r = r.then(t.shift(), t.shift());return r;
    }, i.forEach(["delete", "get", "head"], function (e) {
      n.prototype[e] = function (t, r) {
        return this.request(i.merge(r || {}, { method: e, url: t }));
      };
    }), i.forEach(["post", "put", "patch"], function (e) {
      n.prototype[e] = function (t, r, n) {
        return this.request(i.merge(n || {}, { method: e, url: t, data: r }));
      };
    }), e.exports = n;
  }, function (e, t, r) {
    "use strict";

    function n(e, t) {
      !o.isUndefined(e) && o.isUndefined(e["Content-Type"]) && (e["Content-Type"] = t);
    }var o = r(6),
    i = r(10),
    s = /^\)\]\}',?\n/,
    a = { "Content-Type": "application/x-www-form-urlencoded" };e.exports = { transformRequest: [function (e, t) {
        return i(t, "Content-Type"), o.isFormData(e) || o.isArrayBuffer(e) || o.isStream(e) || o.isFile(e) || o.isBlob(e) ? e : o.isArrayBufferView(e) ? e.buffer : o.isURLSearchParams(e) ? (n(t, "application/x-www-form-urlencoded;charset=utf-8"), e.toString()) : o.isObject(e) ? (n(t, "application/json;charset=utf-8"), JSON.stringify(e)) : e;
      }], transformResponse: [function (e) {
        if ("string" == typeof e) {
          e = e.replace(s, "");try {
            e = JSON.parse(e);
          } catch (t) {}
        }return e;
      }], headers: { common: { Accept: "application/json, text/plain, */*" }, patch: o.merge(a), post: o.merge(a), put: o.merge(a) }, timeout: 0, xsrfCookieName: "XSRF-TOKEN", xsrfHeaderName: "X-XSRF-TOKEN", maxContentLength: -1, validateStatus: function (e) {
        return e >= 200 && e < 300;
      } };
  }, function (e, t, r) {
    "use strict";

    var n = r(6);e.exports = function (e, t) {
      n.forEach(e, function (r, n) {
        n !== t && n.toUpperCase() === t.toUpperCase() && (e[t] = r, delete e[n]);
      });
    };
  }, function (e, t, r) {
    "use strict";

    function n() {
      this.handlers = [];
    }var o = r(6);n.prototype.use = function (e, t) {
      return this.handlers.push({ fulfilled: e, rejected: t }), this.handlers.length - 1;
    }, n.prototype.eject = function (e) {
      this.handlers[e] && (this.handlers[e] = null);
    }, n.prototype.forEach = function (e) {
      o.forEach(this.handlers, function (t) {
        null !== t && e(t);
      });
    }, e.exports = n;
  }, function (e, t, r) {
    (function (t) {
      "use strict";

      var n = r(6),
      o = r(14);e.exports = function (e) {
        e.headers = e.headers || {}, e.data = o(e.data, e.headers, e.transformRequest), e.headers = n.merge(e.headers.common || {}, e.headers[e.method] || {}, e.headers || {}), n.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function (t) {
          delete e.headers[t];
        });var i;return "function" == typeof e.adapter ? i = e.adapter : "undefined" != typeof XMLHttpRequest ? i = r(15) : "undefined" != typeof t && (i = r(15)), Promise.resolve(e).then(i).then(function (t) {
          return t.data = o(t.data, t.headers, e.transformResponse), t;
        }, function (t) {
          return t && t.response && (t.response.data = o(t.response.data, t.response.headers, e.transformResponse)), Promise.reject(t);
        });
      };
    }).call(t, r(13));
  }, function (e, t) {
    function r() {
      throw new Error("setTimeout has not been defined");
    }function n() {
      throw new Error("clearTimeout has not been defined");
    }function o(e) {
      if (f === setTimeout) return setTimeout(e, 0);if ((f === r || !f) && setTimeout) return f = setTimeout, setTimeout(e, 0);try {
        return f(e, 0);
      } catch (t) {
        try {
          return f.call(null, e, 0);
        } catch (t) {
          return f.call(this, e, 0);
        }
      }
    }function i(e) {
      if (p === clearTimeout) return clearTimeout(e);if ((p === n || !p) && clearTimeout) return p = clearTimeout, clearTimeout(e);try {
        return p(e);
      } catch (t) {
        try {
          return p.call(null, e);
        } catch (t) {
          return p.call(this, e);
        }
      }
    }function s() {
      y && h && (y = !1, h.length ? d = h.concat(d) : m = -1, d.length && a());
    }function a() {
      if (!y) {
        var e = o(s);y = !0;for (var t = d.length; t;) {
          for (h = d, d = []; ++m < t;) h && h[m].run();m = -1, t = d.length;
        }h = null, y = !1, i(e);
      }
    }function u(e, t) {
      this.fun = e, this.array = t;
    }function c() {}var f,
    p,
    l = e.exports = {};!function () {
      try {
        f = "function" == typeof setTimeout ? setTimeout : r;
      } catch (e) {
        f = r;
      }try {
        p = "function" == typeof clearTimeout ? clearTimeout : n;
      } catch (e) {
        p = n;
      }
    }();var h,
    d = [],
    y = !1,
    m = -1;l.nextTick = function (e) {
      var t = new Array(arguments.length - 1);if (arguments.length > 1) for (var r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];d.push(new u(e, t)), 1 !== d.length || y || o(a);
    }, u.prototype.run = function () {
      this.fun.apply(null, this.array);
    }, l.title = "browser", l.browser = !0, l.env = {}, l.argv = [], l.version = "", l.versions = {}, l.on = c, l.addListener = c, l.once = c, l.off = c, l.removeListener = c, l.removeAllListeners = c, l.emit = c, l.prependListener = c, l.prependOnceListener = c, l.listeners = function (e) {
      return [];
    }, l.binding = function (e) {
      throw new Error("process.binding is not supported");
    }, l.cwd = function () {
      return "/";
    }, l.chdir = function (e) {
      throw new Error("process.chdir is not supported");
    }, l.umask = function () {
      return 0;
    };
  }, function (e, t, r) {
    "use strict";

    var n = r(6);e.exports = function (e, t, r) {
      return n.forEach(r, function (r) {
        e = r(e, t);
      }), e;
    };
  }, function (e, t, r) {
    (function (t) {
      "use strict";

      var n = r(6),
      o = r(16),
      i = r(19),
      s = r(20),
      a = r(21),
      u = r(17),
      c = "undefined" != typeof window && window.btoa || r(22);e.exports = function (e) {
        return new Promise(function (f, p) {
          var l = e.data,
          h = e.headers;n.isFormData(l) && delete h["Content-Type"];var d = new XMLHttpRequest(),
          y = "onreadystatechange",
          m = !1;if ("test" === t.env.NODE_ENV || "undefined" == typeof window || !window.XDomainRequest || "withCredentials" in d || a(e.url) || (d = new window.XDomainRequest(), y = "onload", m = !0, d.onprogress = function () {}, d.ontimeout = function () {}), e.auth) {
            var g = e.auth.username || "",
            v = e.auth.password || "";h.Authorization = "Basic " + c(g + ":" + v);
          }if (d.open(e.method.toUpperCase(), i(e.url, e.params, e.paramsSerializer), !0), d.timeout = e.timeout, d[y] = function () {
            if (d && (4 === d.readyState || m) && 0 !== d.status) {
              var t = "getAllResponseHeaders" in d ? s(d.getAllResponseHeaders()) : null,
              r = e.responseType && "text" !== e.responseType ? d.response : d.responseText,
              n = { data: r, status: 1223 === d.status ? 204 : d.status, statusText: 1223 === d.status ? "No Content" : d.statusText, headers: t, config: e, request: d };o(f, p, n), d = null;
            }
          }, d.onerror = function () {
            p(u("Network Error", e)), d = null;
          }, d.ontimeout = function () {
            p(u("timeout of " + e.timeout + "ms exceeded", e, "ECONNABORTED")), d = null;
          }, n.isStandardBrowserEnv()) {
            var b = r(23),
            w = e.withCredentials || a(e.url) ? b.read(e.xsrfCookieName) : void 0;w && (h[e.xsrfHeaderName] = w);
          }if ("setRequestHeader" in d && n.forEach(h, function (e, t) {
            "undefined" == typeof l && "content-type" === t.toLowerCase() ? delete h[t] : d.setRequestHeader(t, e);
          }), e.withCredentials && (d.withCredentials = !0), e.responseType) try {
            d.responseType = e.responseType;
          } catch (j) {
            if ("json" !== d.responseType) throw j;
          }"function" == typeof e.progress && ("post" === e.method || "put" === e.method ? d.upload.addEventListener("progress", e.progress) : "get" === e.method && d.addEventListener("progress", e.progress)), void 0 === l && (l = null), d.send(l);
        });
      };
    }).call(t, r(13));
  }, function (e, t, r) {
    "use strict";

    var n = r(17);e.exports = function (e, t, r) {
      var o = r.config.validateStatus;r.status && o && !o(r.status) ? t(n("Request failed with status code " + r.status, r.config, null, r)) : e(r);
    };
  }, function (e, t, r) {
    "use strict";

    var n = r(18);e.exports = function (e, t, r, o) {
      var i = new Error(e);return n(i, t, r, o);
    };
  }, function (e, t) {
    "use strict";

    e.exports = function (e, t, r, n) {
      return e.config = t, r && (e.code = r), e.response = n, e;
    };
  }, function (e, t, r) {
    "use strict";

    function n(e) {
      return encodeURIComponent(e).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
    }var o = r(6);e.exports = function (e, t, r) {
      if (!t) return e;var i;if (r) i = r(t);else if (o.isURLSearchParams(t)) i = t.toString();else {
        var s = [];o.forEach(t, function (e, t) {
          null !== e && "undefined" != typeof e && (o.isArray(e) && (t += "[]"), o.isArray(e) || (e = [e]), o.forEach(e, function (e) {
            o.isDate(e) ? e = e.toISOString() : o.isObject(e) && (e = JSON.stringify(e)), s.push(n(t) + "=" + n(e));
          }));
        }), i = s.join("&");
      }return i && (e += (e.indexOf("?") === -1 ? "?" : "&") + i), e;
    };
  }, function (e, t, r) {
    "use strict";

    var n = r(6);e.exports = function (e) {
      var t,
      r,
      o,
      i = {};return e ? (n.forEach(e.split("\n"), function (e) {
        o = e.indexOf(":"), t = n.trim(e.substr(0, o)).toLowerCase(), r = n.trim(e.substr(o + 1)), t && (i[t] = i[t] ? i[t] + ", " + r : r);
      }), i) : i;
    };
  }, function (e, t, r) {
    "use strict";

    var n = r(6);e.exports = n.isStandardBrowserEnv() ? function () {
      function e(e) {
        var t = e;return r && (o.setAttribute("href", t), t = o.href), o.setAttribute("href", t), { href: o.href, protocol: o.protocol ? o.protocol.replace(/:$/, "") : "", host: o.host, search: o.search ? o.search.replace(/^\?/, "") : "", hash: o.hash ? o.hash.replace(/^#/, "") : "", hostname: o.hostname, port: o.port, pathname: "/" === o.pathname.charAt(0) ? o.pathname : "/" + o.pathname };
      }var t,
      r = /(msie|trident)/i.test(navigator.userAgent),
      o = document.createElement("a");return t = e(window.location.href), function (r) {
        var o = n.isString(r) ? e(r) : r;return o.protocol === t.protocol && o.host === t.host;
      };
    }() : function () {
      return function () {
        return !0;
      };
    }();
  }, function (e, t) {
    "use strict";

    function r() {
      this.message = "String contains an invalid character";
    }function n(e) {
      for (var t, n, i = String(e), s = "", a = 0, u = o; i.charAt(0 | a) || (u = "=", a % 1); s += u.charAt(63 & t >> 8 - a % 1 * 8)) {
        if (n = i.charCodeAt(a += .75), n > 255) throw new r();t = t << 8 | n;
      }return s;
    }var o = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.prototype = new Error(), r.prototype.code = 5, r.prototype.name = "InvalidCharacterError", e.exports = n;
  }, function (e, t, r) {
    "use strict";

    var n = r(6);e.exports = n.isStandardBrowserEnv() ? function () {
      return { write: function (e, t, r, o, i, s) {
          var a = [];a.push(e + "=" + encodeURIComponent(t)), n.isNumber(r) && a.push("expires=" + new Date(r).toGMTString()), n.isString(o) && a.push("path=" + o), n.isString(i) && a.push("domain=" + i), s === !0 && a.push("secure"), document.cookie = a.join("; ");
        }, read: function (e) {
          var t = document.cookie.match(new RegExp("(^|;\\s*)(" + e + ")=([^;]*)"));return t ? decodeURIComponent(t[3]) : null;
        }, remove: function (e) {
          this.write(e, "", Date.now() - 864e5);
        } };
    }() : function () {
      return { write: function () {}, read: function () {
          return null;
        }, remove: function () {} };
    }();
  }, function (e, t) {
    "use strict";

    e.exports = function (e) {
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e);

    };
  }, function (e, t) {
    "use strict";

    e.exports = function (e, t) {
      return e.replace(/\/+$/, "") + "/" + t.replace(/^\/+/, "");
    };
  }, function (e, t) {
    "use strict";

    e.exports = function (e) {
      return function (t) {
        return e.apply(null, t);
      };
    };
  }, function (e, t, r) {
    "use strict";

    function n(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }var o = function () {
      function e(e, t) {
        for (var r = 0; r < t.length; r++) {
          var n = t[r];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, r, n) {
        return r && e(t.prototype, r), n && e(t, n), t;
      };
    }(),
    i = r(3);e.exports = function () {
      function e(t, r) {
        n(this, e), this.options = t, this.request = r;
      }return o(e, [{ key: "get", value: function (e) {
          var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "json";return this.options.methods.hasOwnProperty(i.get) ? this.request.issueRequest(i.get, this.options.methods.get.path.replace(this.options.methods.get.path.match(/\{.*?\}/), e) + "?_format=" + t, "") : Promise.reject("The method, " + i.get + ", is not available.");
        } }, { key: "patch", value: function (e) {
          var t = this,
          r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
          n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "application/json";return this.options.methods.hasOwnProperty(i.patch) ? this.request.getXCSRFToken().then(function (o) {
            return t.request.issueRequest(i.patch, "" + t.options.methods.patch.path.replace(t.options.methods.patch.path.match(/\{.*?\}/), e), o, { "Content-Type": n }, r);
          }) : Promise.reject("The method, " + i.patch + ", is not available.");
        } }, { key: "post", value: function (e) {
          var t = this,
          r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "application/json",
          n = arguments[2];if (!this.options.methods.hasOwnProperty(i.post)) return Promise.reject("The method, " + i.post + ", is not available.");if (n) {
            var o = this.checkRequiredFields(e);if (o.length) return Promise.reject("The following fields, " + o.join(", ") + ", are required.");
          }return this.request.getXCSRFToken().then(function (n) {
            return t.request.issueRequest(i.post, t.options.methods.post.path, n, { "Content-Type": r }, e);
          });
        } }, { key: "delete", value: function (e) {
          var t = this;return this.options.methods.hasOwnProperty(i["delete"]) ? this.request.getXCSRFToken().then(function (r) {
            return t.request.issueRequest(i["delete"], "" + t.options.methods["delete"].path.replace(t.options.methods["delete"].path.match(/\{.*?\}/), e), r);
          }) : Promise.reject("The method, " + i["delete"] + ", is not available.");
        } }, { key: "checkRequiredFields", value: function (e) {
          var t = Object.keys(e);return this.options.metadata.requiredFields.filter(function (e) {
            return !t.includes(e);
          });
        } }, { key: "setFields", value: function (e, t) {
          var r = this,
          n = Object.keys(this.options.metadata.properties),
          o = Object.keys(t).map(function (e) {
            return !n.includes(e) && e;
          }).filter(Boolean);if (o.length) return Promise.reject(new Error("The " + (o.length > 1 ? "fields" : "field") + ", " + o.join(", ") + ", " + (o.length > 1 ? "are" : "is") + " not included within the bundle, " + this.options.bundle + "."));var i = {};return Object.keys(t).forEach(function (e) {
            var n = r.options.metadata.properties[e];i[e] = [];var o = {};Object.keys(n.items.properties).forEach(function (r) {
              t[e].hasOwnProperty(r) && (o[r] = t[e][r]);
            }), i[e].push(o);
          }), i.type = [{ target_id: this.options.bundle, target_type: this.options.entity + "_type" }], this.patch(e, i);
        } }]), e;
    }();
  }, function (e, t, r) {
    "use strict";

    function n(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }var o = function () {
      function e(e, t) {
        for (var r = 0; r < t.length; r++) {
          var n = t[r];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, r, n) {
        return r && e(t.prototype, r), n && e(t, n), t;
      };
    }(),
    i = r(3),
    s = r(29);e.exports = function () {
      function e(t, r) {
        n(this, e), this.request = r, this.jsonapiPrefix = t.jsonapiPrefix || "jsonapi";
      }return o(e, [{ key: "get", value: function (e, t) {
          var r = arguments.length > 2 && void 0 !== arguments[2] && arguments[2],
          n = "api_json",
          o = "/" + this.jsonapiPrefix + "/" + e + (r ? "/" + r : "") + "?_format=" + n + (Object.keys(t).length ? "&" + s.stringify(t, { indices: !1 }) : "");return this.request.issueRequest(i.get, o);
        } }, { key: "post", value: function (e, t) {
          var r = "api_json";return this.request.issueRequest(i.post, "/" + this.jsonapiPrefix + "/" + e + "?_format=" + r, "", { "Content-Type": "application/vnd.api+json" }, t);
        } }, { key: "patch", value: function (e, t) {
          var r = "api_json";return this.request.issueRequest(i.patch, "/" + this.jsonapiPrefix + "/" + e + "?_format=" + r, "", { "Content-Type": "application/vnd.api+json" }, t);
        } }, { key: "delete", value: function (e, t) {
          var r = "api_json",
          n = "/" + this.jsonapiPrefix + "/" + e + "/" + t + "?_format=" + r;return this.request.issueRequest(i["delete"], n, "", { "Content-Type": "application/vnd.api+json" });
        } }]), e;
    }();
  }, function (e, t, r) {
    "use strict";

    var n = r(30),
    o = r(32);e.exports = { stringify: n, parse: o };
  }, function (e, t, r) {
    "use strict";

    var n = r(31),
    o = { brackets: function (e) {
        return e + "[]";
      }, indices: function (e, t) {
        return e + "[" + t + "]";
      }, repeat: function (e) {
        return e;
      } },
    i = { delimiter: "&", strictNullHandling: !1, skipNulls: !1, encode: !0, encoder: n.encode },
    s = function a(e, t, r, o, i, s, u, c, f) {
      var p = e;if ("function" == typeof u) p = u(t, p);else if (p instanceof Date) p = p.toISOString();else if (null === p) {
        if (o) return s ? s(t) : t;p = "";
      }if ("string" == typeof p || "number" == typeof p || "boolean" == typeof p || n.isBuffer(p)) return s ? [s(t) + "=" + s(p)] : [t + "=" + String(p)];var l = [];if ("undefined" == typeof p) return l;var h;if (Array.isArray(u)) h = u;else {
        var d = Object.keys(p);h = c ? d.sort(c) : d;
      }for (var y = 0; y < h.length; ++y) {
        var m = h[y];i && null === p[m] || (l = Array.isArray(p) ? l.concat(a(p[m], r(t, m), r, o, i, s, u, c, f)) : l.concat(a(p[m], t + (f ? "." + m : "[" + m + "]"), r, o, i, s, u, c, f)));
      }return l;
    };e.exports = function (e, t) {
      var r,
      n,
      a = e,
      u = t || {},
      c = "undefined" == typeof u.delimiter ? i.delimiter : u.delimiter,
      f = "boolean" == typeof u.strictNullHandling ? u.strictNullHandling : i.strictNullHandling,
      p = "boolean" == typeof u.skipNulls ? u.skipNulls : i.skipNulls,
      l = "boolean" == typeof u.encode ? u.encode : i.encode,
      h = l ? "function" == typeof u.encoder ? u.encoder : i.encoder : null,
      d = "function" == typeof u.sort ? u.sort : null,
      y = "undefined" != typeof u.allowDots && u.allowDots;if (null !== u.encoder && void 0 !== u.encoder && "function" != typeof u.encoder) throw new TypeError("Encoder has to be a function.");"function" == typeof u.filter ? (n = u.filter, a = n("", a)) : Array.isArray(u.filter) && (r = n = u.filter);var m = [];if ("object" != typeof a || null === a) return "";var g;g = u.arrayFormat in o ? u.arrayFormat : "indices" in u ? u.indices ? "indices" : "repeat" : "indices";var v = o[g];r || (r = Object.keys(a)), d && r.sort(d);for (var b = 0; b < r.length; ++b) {
        var w = r[b];p && null === a[w] || (m = m.concat(s(a[w], w, v, f, p, h, n, d, y)));
      }return m.join(c);
    };
  }, function (e, t) {
    "use strict";

    var r = function () {
      for (var e = new Array(256), t = 0; t < 256; ++t) e[t] = "%" + ((t < 16 ? "0" : "") + t.toString(16)).toUpperCase();return e;
    }();t.arrayToObject = function (e, t) {
      for (var r = t.plainObjects ? Object.create(null) : {}, n = 0; n < e.length; ++n) "undefined" != typeof e[n] && (r[n] = e[n]);return r;
    }, t.merge = function (e, r, n) {
      if (!r) return e;if ("object" != typeof r) {
        if (Array.isArray(e)) e.push(r);else {
          if ("object" != typeof e) return [e, r];e[r] = !0;
        }return e;
      }if ("object" != typeof e) return [e].concat(r);var o = e;return Array.isArray(e) && !Array.isArray(r) && (o = t.arrayToObject(e, n)), Object.keys(r).reduce(function (e, o) {
        var i = r[o];return Object.prototype.hasOwnProperty.call(e, o) ? e[o] = t.merge(e[o], i, n) : e[o] = i, e;
      }, o);
    }, t.decode = function (e) {
      try {
        return decodeURIComponent(e.replace(/\+/g, " "));
      } catch (t) {
        return e;
      }
    }, t.encode = function (e) {
      if (0 === e.length) return e;for (var t = "string" == typeof e ? e : String(e), n = "", o = 0; o < t.length; ++o) {
        var i = t.charCodeAt(o);45 === i || 46 === i || 95 === i || 126 === i || i >= 48 && i <= 57 || i >= 65 && i <= 90 || i >= 97 && i <= 122 ? n += t.charAt(o) : i < 128 ? n += r[i] : i < 2048 ? n += r[192 | i >> 6] + r[128 | 63 & i] : i < 55296 || i >= 57344 ? n += r[224 | i >> 12] + r[128 | i >> 6 & 63] + r[128 | 63 & i] : (o += 1, i = 65536 + ((1023 & i) << 10 | 1023 & t.charCodeAt(o)), n += r[240 | i >> 18] + r[128 | i >> 12 & 63] + r[128 | i >> 6 & 63] + r[128 | 63 & i]);
      }return n;
    }, t.compact = function (e, r) {
      if ("object" != typeof e || null === e) return e;var n = r || [],
      o = n.indexOf(e);if (o !== -1) return n[o];if (n.push(e), Array.isArray(e)) {
        for (var i = [], s = 0; s < e.length; ++s) e[s] && "object" == typeof e[s] ? i.push(t.compact(e[s], n)) : "undefined" != typeof e[s] && i.push(e[s]);return i;
      }for (var a = Object.keys(e), u = 0; u < a.length; ++u) {
        var c = a[u];e[c] = t.compact(e[c], n);
      }return e;
    }, t.isRegExp = function (e) {
      return "[object RegExp]" === Object.prototype.toString.call(e);
    }, t.isBuffer = function (e) {
      return null !== e && "undefined" != typeof e && !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
    };
  }, function (e, t, r) {
    "use strict";

    var n = r(31),
    o = Object.prototype.hasOwnProperty,
    i = { delimiter: "&", depth: 5, arrayLimit: 20, parameterLimit: 1e3, strictNullHandling: !1, plainObjects: !1, allowPrototypes: !1, allowDots: !1, decoder: n.decode },
    s = function (e, t) {
      for (var r = {}, n = e.split(t.delimiter, t.parameterLimit === 1 / 0 ? void 0 : t.parameterLimit), i = 0; i < n.length; ++i) {
        var s,
        a,
        u = n[i],
        c = u.indexOf("]=") === -1 ? u.indexOf("=") : u.indexOf("]=") + 1;c === -1 ? (s = t.decoder(u), a = t.strictNullHandling ? null : "") : (s = t.decoder(u.slice(0, c)), a = t.decoder(u.slice(c + 1))), o.call(r, s) ? r[s] = [].concat(r[s]).concat(a) : r[s] = a;
      }return r;
    },
    a = function c(e, t, r) {
      if (!e.length) return t;var n,
      o = e.shift();if ("[]" === o) n = [], n = n.concat(c(e, t, r));else {
        n = r.plainObjects ? Object.create(null) : {};var i = "[" === o[0] && "]" === o[o.length - 1] ? o.slice(1, o.length - 1) : o,
        s = parseInt(i, 10);!isNaN(s) && o !== i && String(s) === i && s >= 0 && r.parseArrays && s <= r.arrayLimit ? (n = [], n[s] = c(e, t, r)) : n[i] = c(e, t, r);
      }return n;
    },
    u = function (e, t, r) {
      if (e) {
        var n = r.allowDots ? e.replace(/\.([^\.\[]+)/g, "[$1]") : e,
        i = /^([^\[\]]*)/,
        s = /(\[[^\[\]]*\])/g,
        u = i.exec(n),
        c = [];if (u[1]) {
          if (!r.plainObjects && o.call(Object.prototype, u[1]) && !r.allowPrototypes) return;c.push(u[1]);
        }for (var f = 0; null !== (u = s.exec(n)) && f < r.depth;) f += 1, (r.plainObjects || !o.call(Object.prototype, u[1].replace(/\[|\]/g, "")) || r.allowPrototypes) && c.push(u[1]);return u && c.push("[" + n.slice(u.index) + "]"), a(c, t, r);
      }
    };e.exports = function (e, t) {
      var r = t || {};if (null !== r.decoder && void 0 !== r.decoder && "function" != typeof r.decoder) throw new TypeError("Decoder has to be a function.");if (r.delimiter = "string" == typeof r.delimiter || n.isRegExp(r.delimiter) ? r.delimiter : i.delimiter, r.depth = "number" == typeof r.depth ? r.depth : i.depth, r.arrayLimit = "number" == typeof r.arrayLimit ? r.arrayLimit : i.arrayLimit, r.parseArrays = r.parseArrays !== !1, r.decoder = "function" == typeof r.decoder ? r.decoder : i.decoder, r.allowDots = "boolean" == typeof r.allowDots ? r.allowDots : i.allowDots, r.plainObjects = "boolean" == typeof r.plainObjects ? r.plainObjects : i.plainObjects, r.allowPrototypes = "boolean" == typeof r.allowPrototypes ? r.allowPrototypes : i.allowPrototypes, r.parameterLimit = "number" == typeof r.parameterLimit ? r.parameterLimit : i.parameterLimit, r.strictNullHandling = "boolean" == typeof r.strictNullHandling ? r.strictNullHandling : i.strictNullHandling, "" === e || null === e || "undefined" == typeof e) return r.plainObjects ? Object.create(null) : {};for (var o = "string" == typeof e ? s(e, r) : e, a = r.plainObjects ? Object.create(null) : {}, c = Object.keys(o), f = 0; f < c.length; ++f) {
        var p = c[f],
        l = u(p, o[p], r);a = n.merge(a, l, r);
      }return n.compact(a);
    };
  }, function (e, t) {
    "use strict";

    function r(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }var n = function () {
      function e(e, t) {
        for (var r = 0; r < t.length; r++) {
          var n = t[r];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, r, n) {
        return r && e(t.prototype, r), n && e(t, n), t;
      };
    }();e.exports = function () {
      function e(t) {
        r(this, e), this.swagger = t, this.entities = {};
      }return n(e, [{ key: "collectEntities", value: function () {
          var e = this;return Object.keys(this.swagger.paths).forEach(function (t) {
            Object.keys(e.swagger.paths[t]).forEach(function (r) {
              var n = e.swagger.paths[t][r].tags[0],
              o = new RegExp(n + ":(.*)"),
              i = Object.keys(e.swagger.definitions).filter(function (e) {
                return o.test(e);
              });(i.length ? i : [n]).forEach(function (n) {
                var o = e.swagger.definitions[n].hasOwnProperty("allOf") ? e.swagger.definitions[n].allOf[1] : e.swagger.definitions[n];e.swagger.definitions[n].hasOwnProperty("allOf") && (o.properties = Object.assign(o.properties, e.swagger.definitions[e.swagger.definitions[n].allOf[0].$ref.split("/").pop()].properties)), e.entities.hasOwnProperty(n) || (e.entities[n] = {}), e.entities[n].methods = e.entities[n].methods ? e.entities[n].methods : {}, e.entities[n].methods[r] = { path: t, parameters: e.swagger.paths[t][r].parameters }, e.entities[n].properties = e.entities[n].properties ? e.entities[n].properties : o.properties, e.entities[n].requiredFields = e.entities[n].requiredFields ? e.entities[n].requiredFields : o.required;
              });
            });
          }), this.entities;
        } }]), e;
    }();
  }, function (e, t, r) {
    "use strict";

    function n(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }var o = function () {
      function e(e, t) {
        for (var r = 0; r < t.length; r++) {
          var n = t[r];n.enumerable = n.enumerable || !1, n.configurable = !0, "value" in n && (n.writable = !0), Object.defineProperty(e, n.key, n);
        }
      }return function (t, r, n) {
        return r && e(t.prototype, r), n && e(t, n), t;
      };
    }(),
    i = r(3),
    s = r(4),
    a = r(29);e.exports = function () {
      function e(t, r) {
        n(this, e), this.basePath = t, this.tokenInformation = Object.assign({}, r), this.tokenInformation.grant_type = "password";
      }return o(e, [{ key: "getToken", value: function () {
          var e = this,
          t = new Date().getTime();return this.tokenInformation.access_token && this.hasOwnProperty("tokenExpireTime") && this.tokenExpireTime > t ? Promise.resolve() : this.bearerPromise ? this.bearerPromise : (this.tokenInformation.access_token && (this.tokenInformation.grant_type = "refresh_token"), this.bearerPromise = s({ method: i.post, url: this.basePath + "/oauth/token", data: a.stringify(this.tokenInformation) }).then(function (t) {
            delete e.bearerPromise;var r = new Date();return r.setSeconds(+r.getSeconds() + t.data.expires_in), e.tokenExpireTime = r.getTime(), Object.assign(e.tokenInformation, t.data), t.data;
          })["catch"](function (t) {
            return delete e.bearerPromise, Promise.reject(t);
          }), this.bearerPromise);
        } }]), e;
    }();
  }]);
});