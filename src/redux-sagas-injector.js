/**
 * Created by guillaume on 1/17/17.
 */

import {createInjectStore} from 'redux-reducers-injector';
import createSagaMiddleware from 'redux-saga';
import {take, fork, cancel} from 'redux-saga/effects';

export {injectReducer, reloadReducer} from 'redux-reducers-injector';

export const CANCEL_SAGAS_HMR = 'CANCEL_SAGAS_HMR';

let original_store = {};

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

    cancelSaga(key, store = original_store) {
        store.dispatch({
            type: CANCEL_SAGAS_HMR,
            payload: key,
        });
    },
};

export function reloadSaga(key, saga, store = original_store) {
    SagaManager.cancelSaga(key, store);
    SagaManager.startSaga(key, saga);
}

export function injectSaga(key, saga, force = false, store = original_store) {
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
    original_store = createInjectStore(initialReducers, ...args);
    original_store.injectedSagas = [];

    injectSaga(Object.keys(rootSaga)[0], rootSaga[Object.keys(rootSaga)[0]], false, original_store);

    return original_store;
}

export const sagaMiddleware = createSagaMiddleware();

export default createInjectSagasStore;
