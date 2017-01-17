'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.sagaMiddleware = undefined;
exports.injectSaga = injectSaga;
exports.createInjectSagasStore = createInjectSagasStore;

var _reduxInjector = require('redux-injector');

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Created by guillaume on 1/17/17.
                                                                                                                                                                                                     */

var sagaMiddleware = exports.sagaMiddleware = (0, _reduxSaga2.default)();

var store = {};

function injectSaga(key, saga) {
    var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    // If already set, do nothing.
    if (store.injectedSagas.includes(key) || force) return;

    store.injectedSagas = [].concat(_toConsumableArray(store.injectedSagas), [key]);
    sagaMiddleware.run(saga);
}

function createInjectSagasStore(initialReducers, rootSaga) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
    }

    store = _reduxInjector.createInjectStore.apply(undefined, [initialReducers].concat(args));
    store.injectedSagas = [];

    injectSaga('rootSaga', rootSaga);

    return store;
}

exports.default = createInjectSagasStore;