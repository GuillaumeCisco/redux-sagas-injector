# redux-sagas-injector
Helper for loading sagas asynchronously using redux with redux-injector

Adding a new saga is then done with injectSaga at any time.
You can also make them hot replacement module compatible thanks to the reloadSaga helper. :tada:

## Installation
Install ```redux-sagas-injector``` via npm.

```javascript
npm install --save redux-sagas-injector
```

Then with a module bundler like webpack that supports either CommonJS or ES2015 modules, use as you would anything else:
 
 ```javascript
 // using an ES6 transpiler, like babel
import {createInjectSagasStore} from './redux-sagas-injector';

 // not using an ES6 transpiler
 var createInjectSagasStore = require('redux-sagas-injector').createInjectSagasStore;
 ```

## Use `createInjectSagasStore` instead of `createStore` or `createInjectStore`

You also need to use the `sagaMiddleware` from the lib. It is basically a `createSagaMiddleware()` from 'redux-saga'.

```javascript
import {createInjectSagasStore, sagaMiddleware, reloadSaga} from './redux-sagas-injector';
import rootSaga from './sagas';
 
const enhancers = [
        applyMiddleware(
            sagaMiddleware,
            routerMiddleware(hashHistory),
        ),];

const store = createInjectSagasStore({'rootSaga': rootSaga}, rootReducer, initialState, compose(...enhancers));

// Hot reload sagas (requires Webpack or Browserify HMR to be enabled)
if (module.hot) {
    module.hot.accept('./sagas', () => {
        reloadSaga('rootSaga', require('./sagas').default);
    });
}

```
 
 ## Injecting a new saga.
 For any store created using redux-sagas-injector, simply use ```injectSaga``` to add a new saga.
 
 ```javascript
 import { injectSaga } from 'redux-sagas-injector';
 
 injectSaga('my_saga', require('./path_to_my_saga').default);
 ```

Be careful when injecting a saga,  every time you'll use it, it will add a new saga.
A Saga is defined by a key (string) and a array of strings is persisted in the store.
You cannot erase it or delete it.
Reinjecting a saga with the same key will do nothing.

You should use injectSaga in complement with injectReducer for loading your js code asynchronously via routing.

## Example:

 ```javascript
import {injectReducer} from 'redux-reducers-injector';
import {reloadSaga} from 'redux-sagas-injector';

export default {
    path: 'item(/:id)',
    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            injectSaga('item', require('./sagas').default);
            injectReducer('item', require('./reducer').default);

            // Configure hot module replacement for the reducer
            if (process.env.NODE_ENV !== 'production') {
                if (module.hot) {
                    module.hot.accept('./reducer', () => {
                        reloadReducer('item', require('./reducer').default);
                    });
                    
                    module.hot.accept('./sagas', () => {
                        reloadSaga('item', require('./sagas').default);
                    });
                }
            }

            cb(null, require('./components/layout').default);
        });
    },
};

 ```