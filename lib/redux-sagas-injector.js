"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SagaManager = exports.CANCEL_SAGAS_HMR = void 0;
exports.createInjectSagasStore = createInjectSagasStore;
exports["default"] = void 0;
Object.defineProperty(exports, "injectReducer", {
  enumerable: true,
  get: function get() {
    return _reduxReducersInjector.injectReducer;
  }
});
Object.defineProperty(exports, "injectReducerBulk", {
  enumerable: true,
  get: function get() {
    return _reduxReducersInjector.injectReducerBulk;
  }
});
exports.injectSaga = injectSaga;
exports.injectSagaBulk = injectSagaBulk;
Object.defineProperty(exports, "reloadReducer", {
  enumerable: true,
  get: function get() {
    return _reduxReducersInjector.reloadReducer;
  }
});
exports.reloadSaga = reloadSaga;
exports.sagaMiddleware = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _reduxReducersInjector = require("redux-reducers-injector");
var _reduxSaga = _interopRequireDefault(require("redux-saga"));
var _effects = require("redux-saga/effects");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); } /**
 * Created by guillaume on 1/17/17.
 */
var CANCEL_SAGAS_HMR = exports.CANCEL_SAGAS_HMR = 'CANCEL_SAGAS_HMR';
var original_store = {};
function createAbortableSaga(key, saga) {
  if (process.env.NODE_ENV === 'development') {
    return /*#__PURE__*/_regenerator().m(function main() {
      var sagaTask, _yield$take, payload;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _context.n = 1;
            return (0, _effects.fork)(saga);
          case 1:
            sagaTask = _context.v;
            _context.n = 2;
            return (0, _effects.take)(CANCEL_SAGAS_HMR);
          case 2:
            _yield$take = _context.v;
            payload = _yield$take.payload;
            if (!(payload === key)) {
              _context.n = 3;
              break;
            }
            _context.n = 3;
            return (0, _effects.cancel)(sagaTask);
          case 3:
            return _context.a(2);
        }
      }, main);
    });
  } else {
    return saga;
  }
}
var SagaManager = exports.SagaManager = {
  startSaga: function startSaga(key, saga) {
    sagaMiddleware.run(createAbortableSaga(key, saga));
  },
  cancelSaga: function cancelSaga(key) {
    var store = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : original_store;
    store.dispatch({
      type: CANCEL_SAGAS_HMR,
      payload: key
    });
  }
};
function reloadSaga(key, saga) {
  var store = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : original_store;
  SagaManager.cancelSaga(key, store);
  SagaManager.startSaga(key, saga);
}
function injectSaga(key, saga) {
  var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var store = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : original_store;
  // If already set, do nothing, except force is specified
  var exists = store.injectedSagas.includes(key);
  if (!exists || force) {
    if (!exists) {
      store.injectedSagas = [].concat((0, _toConsumableArray2["default"])(store.injectedSagas), [key]);
    }
    if (force) {
      SagaManager.cancelSaga(key, store);
    }
    SagaManager.startSaga(key, saga);
  }
}
function injectSagaBulk(sagas) {
  var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var store = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : original_store;
  sagas.forEach(function (x) {
    // If already set, do nothing, except force is specified
    var exists = store.injectedSagas.includes(x.key);
    if (!exists || force) {
      if (!exists) {
        store.injectedSagas = [].concat((0, _toConsumableArray2["default"])(store.injectedSagas), [x.key]);
      }
      if (force) {
        SagaManager.cancelSaga(x.key, store);
      }
      SagaManager.startSaga(x.key, x.saga);
    }
  });
}
function createInjectSagasStore(rootSaga, initialReducers) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }
  original_store = _reduxReducersInjector.createInjectStore.apply(void 0, [initialReducers].concat(args));
  original_store.injectedSagas = [];
  injectSaga(Object.keys(rootSaga)[0], rootSaga[Object.keys(rootSaga)[0]], false, original_store);
  return original_store;
}
var sagaMiddleware = exports.sagaMiddleware = (0, _reduxSaga["default"])();
var _default = exports["default"] = createInjectSagasStore;