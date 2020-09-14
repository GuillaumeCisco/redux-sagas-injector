"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reloadSaga = reloadSaga;
exports.injectSaga = injectSaga;
exports.injectSagaBulk = injectSagaBulk;
exports.createInjectSagasStore = createInjectSagasStore;
Object.defineProperty(exports, "injectReducer", {
  enumerable: true,
  get: function get() {
    return _reduxReducersInjector.injectReducer;
  }
});
Object.defineProperty(exports, "reloadReducer", {
  enumerable: true,
  get: function get() {
    return _reduxReducersInjector.reloadReducer;
  }
});
Object.defineProperty(exports, "injectReducerBulk", {
  enumerable: true,
  get: function get() {
    return _reduxReducersInjector.injectReducerBulk;
  }
});
exports["default"] = exports.sagaMiddleware = exports.SagaManager = exports.CANCEL_SAGAS_HMR = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _reduxReducersInjector = require("redux-reducers-injector");

var _reduxSaga = _interopRequireDefault(require("redux-saga"));

var _effects = require("redux-saga/effects");

/**
 * Created by guillaume on 1/17/17.
 */
var CANCEL_SAGAS_HMR = 'CANCEL_SAGAS_HMR';
exports.CANCEL_SAGAS_HMR = CANCEL_SAGAS_HMR;
var original_store = {};

function createAbortableSaga(key, saga) {
  if (process.env.NODE_ENV === 'development') {
    return /*#__PURE__*/_regenerator["default"].mark(function main() {
      var sagaTask, _yield$take, payload;

      return _regenerator["default"].wrap(function main$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _effects.fork)(saga);

            case 2:
              sagaTask = _context.sent;
              _context.next = 5;
              return (0, _effects.take)(CANCEL_SAGAS_HMR);

            case 5:
              _yield$take = _context.sent;
              payload = _yield$take.payload;

              if (!(payload === key)) {
                _context.next = 10;
                break;
              }

              _context.next = 10;
              return (0, _effects.cancel)(sagaTask);

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, main);
    });
  } else {
    return saga;
  }
}

var SagaManager = {
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
exports.SagaManager = SagaManager;

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

var sagaMiddleware = (0, _reduxSaga["default"])();
exports.sagaMiddleware = sagaMiddleware;
var _default = createInjectSagasStore;
exports["default"] = _default;