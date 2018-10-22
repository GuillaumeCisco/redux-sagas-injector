/**
 * Created by guillaume on 1/17/17.
 */

import {createInjectStore} from 'redux-reducers-injector';
import createSagaMiddleware from 'redux-saga';
import {take, fork, cancel} from 'redux-saga/effects';

export const CANCEL_SAGAS_HMR = 'CANCEL_SAGAS_HMR';

let store = {};

function createAbortableSaga(key, saga, store=store) {
    if (process.env.NODE_ENV === 'development') {
        return function* main() {
            const sagaTask = yield fork(saga);
            const {payload} = yield take(CANCEL_SAGAS_HMR);
           
            if (payload === key) {
                yield cancel(sagaTask, store);
            }
        };
    } else {
        return saga;
    }
}

export const SagaManager = {
    startSaga(key, saga, store=store) {
        sagaMiddleware.run(createAbortableSaga(key, saga, store));
    },

    cancelSaga(key, store=store) {
        store.dispatch({
            type: CANCEL_SAGAS_HMR,
            payload: key,
        });
    },
};

export function reloadSaga(key, saga, store=store) {
    SagaManager.cancelSaga(key, store);
    SagaManager.startSaga(key, saga, store);
}

export function injectSaga(key, saga, force=false, store=store) {
    // If already set, do nothing, except force is specified
    const exists = store.injectedSagas.includes(key);
    if (!exists || force) {
        if (!exists) {
            store.injectedSagas = [...store.injectedSagas, key];
        }
        if (force) {
            SagaManager.cancelSaga(key, store);
        }
        SagaManager.startSaga(key, saga, store);
    }
}

export function createInjectSagasStore(rootSaga, initialReducers, ...args) {
    store = createInjectStore(initialReducers, ...args);
    store.injectedSagas = [];

    injectSaga(Object.keys(rootSaga)[0], rootSaga[Object.keys(rootSaga)[0]], false, store);

    return store;
}

export const sagaMiddleware = createSagaMiddleware();

export default createInjectSagasStore;
