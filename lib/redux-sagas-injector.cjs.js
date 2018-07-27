'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var reduxReducersInjectorForked = require('redux-reducers-injector-forked');
var createSagaMiddleware = _interopDefault(require('redux-saga'));
var effects = require('redux-saga/effects');

const CANCEL_SAGAS_HMR = 'CANCEL_SAGAS_HMR';

let store = {};
let sagaMiddleware;

function createAbortableSaga(key, saga) {
  if (process.env.NODE_ENV === 'development') {
    return function* main() {
      const sagaTask = yield effects.fork(saga);
      const { payload } = yield effects.take(CANCEL_SAGAS_HMR);

      if (payload === key) {
        yield effects.cancel(sagaTask);
      }
    };
  }

  return saga;
}

const SagaManager = {
  startSaga(key, saga) {
    sagaMiddleware.run(createAbortableSaga(key, saga));
  },

  cancelSaga(key) {
    store.dispatch({
      type: CANCEL_SAGAS_HMR,
      payload: key,
    });
  },
};

function reloadSaga(key, saga) {
  SagaManager.cancelSaga(key);
  SagaManager.startSaga(key, saga);
}

function injectSaga(key, saga, force = false) {
  // If already set, do nothing, except force is specified
  const exists = store.injectedSagas.includes(key);
  if (!exists || force) {
    if (!exists) {
      store.injectedSagas = [...store.injectedSagas, key];
    }
    if (force) {
      SagaManager.cancelSaga(key);
    }
    SagaManager.startSaga(key, saga);
  }
}

function createInjectSagasStore(rootSaga, initialReducers, ...args) {
  store = reduxReducersInjectorForked.createInjectStore(initialReducers, ...args);
  store.injectedSagas = [];

  injectSaga(Object.keys(rootSaga)[0], rootSaga[Object.keys(rootSaga)[0]]);

  return store;
}


function createInjectSagasMiddleware(options) {
  sagaMiddleware = createSagaMiddleware(options);
  return sagaMiddleware;
}

exports.CANCEL_SAGAS_HMR = CANCEL_SAGAS_HMR;
exports.SagaManager = SagaManager;
exports.reloadSaga = reloadSaga;
exports.injectSaga = injectSaga;
exports.createInjectSagasStore = createInjectSagasStore;
exports.createInjectSagasMiddleware = createInjectSagasMiddleware;
