'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.sagaMiddleware = exports.SagaManager = exports.CANCEL_SAGAS_HMR = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

exports.reloadSaga = reloadSaga;
exports.injectSaga = injectSaga;
exports.createInjectSagasStore = createInjectSagasStore;

var _reduxReducersInjector = require('redux-reducers-injector');

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

var _effects = require('redux-saga/effects');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CANCEL_SAGAS_HMR = exports.CANCEL_SAGAS_HMR = 'CANCEL_SAGAS_HMR'; /**
                                                                       * Created by guillaume on 1/17/17.
                                                                       */

var store = {};

function createAbortableSaga(key, saga) {
    if (process.env.NODE_ENV === 'development') {
        return (/*#__PURE__*/_regenerator2.default.mark(function main() {
                var sagaTask, _ref, payload;

                return _regenerator2.default.wrap(function main$(_context) {
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
                                _ref = _context.sent;
                                payload = _ref.payload;

                                if (!(payload === key)) {
                                    _context.next = 10;
                                    break;
                                }

                                _context.next = 10;
                                return (0, _effects.cancel)(sagaTask);

                            case 10:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, main, this);
            })
        );
    } else {
        return saga;
    }
}

var SagaManager = exports.SagaManager = {
    startSaga: function startSaga(key, saga) {
        sagaMiddleware.run(createAbortableSaga(key, saga));
    },
    cancelSaga: function cancelSaga(key, store) {
        store.dispatch({
            type: CANCEL_SAGAS_HMR,
            payload: key
        });
    }
};

function reloadSaga(key, saga) {
    SagaManager.cancelSaga(key);
    SagaManager.startSaga(key, saga);
}

function injectSaga(key, saga) {
    var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var store = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : store;

    // If already set, do nothing, except force is specified
    var exists = store.injectedSagas.includes(key);
    if (!exists || force) {
        if (!exists) {
            store.injectedSagas = [].concat((0, _toConsumableArray3.default)(store.injectedSagas), [key]);
        }
        if (force) {
            SagaManager.cancelSaga(key, store);
        }
        SagaManager.startSaga(key, saga);
    }
}

function createInjectSagasStore(rootSaga, initialReducers) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
    }

    store = _reduxReducersInjector.createInjectStore.apply(undefined, [initialReducers].concat(args));
    store.injectedSagas = [];

    injectSaga((0, _keys2.default)(rootSaga)[0], rootSaga[(0, _keys2.default)(rootSaga)[0]]);

    return store;
}

var sagaMiddleware = exports.sagaMiddleware = (0, _reduxSaga2.default)();

exports.default = createInjectSagasStore;