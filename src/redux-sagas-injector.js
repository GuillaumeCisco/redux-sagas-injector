/**
 * Created by guillaume on 1/17/17.
 */

import {createInjectStore} from 'redux-injector';
import createSagaMiddleware from 'redux-saga';

export const sagaMiddleware = createSagaMiddleware();

let store = {};

export function injectSaga(key, saga, force = false) {
    // If already set, do nothing.
    if (store.injectedSagas.includes(key) || force) return;

    store.injectedSagas = [...store.injectedSagas, key];
    sagaMiddleware.run(saga);
}

export function createInjectSagasStore(initialReducers, rootSaga, ...args) {
    store = createInjectStore(initialReducers, ...args);
    store.injectedSagas = [];

    injectSaga('rootSaga', rootSaga);

    return store;
}

export default createInjectSagasStore;