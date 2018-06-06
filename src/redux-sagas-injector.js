/**
 * Created by guillaume on 1/17/17.
 */

import {createInjectStore} from 'redux-reducers-injector-forked';
import createSagaMiddleware from 'redux-saga';
import {take, fork, cancel} from 'redux-saga/effects';

export const CANCEL_SAGAS_HMR = 'CANCEL_SAGAS_HMR';

let store = {};

function createAbortableSaga(key, saga) {
    if (process.env.NODE_ENV === 'development') {
        return function* main() {
            const sagaTask = yield fork(saga);
            const {payload} = yield take(CANCEL_SAGAS_HMR);
           
            if (payload === key) {
                yield cancel(sagaTask);
            }
        };
    } else {
        return saga;
    }
}

export const SagaManager = {
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

export function reloadSaga(key, saga) {
    SagaManager.cancelSaga(key);
    SagaManager.startSaga(key, saga);
}

export function injectSaga(key, saga, force = false) {
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

export function createInjectSagasStore(rootSaga, initialReducers, ...args) {
    store = createInjectStore(initialReducers, ...args);
    store.injectedSagas = [];

    injectSaga(Object.keys(rootSaga)[0], rootSaga[Object.keys(rootSaga)[0]]);

    return store;
}

export const sagaMiddleware = createSagaMiddleware();

export default createInjectSagasStore;
