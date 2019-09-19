# redux-sagas-injector
Helper for loading sagas asynchronously using redux with [redux-reducers-injector](https://github.com/GuillaumeCisco/redux-reducers-injector).

Adding a new saga is then done with injectSaga at any time.
You can also make them hot replacement module compatible thanks to the reloadSaga helper. :tada:

## Installation
Install ```redux-sagas-injector``` via npm or yarn.

```shell
npm install --save redux-sagas-injector
```
or
```shell
yarn add redux-sagas-injector
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
 
 ## Injecting a new saga
 For any store created using redux-sagas-injector, simply use ```injectSaga``` to add a new saga.
 
 ```javascript
 import {injectSaga} from 'redux-sagas-injector';
 
 injectSaga('my_saga', require('./path_to_my_saga').default);
 ```

Be careful when injecting a saga,  every time you'll use it, it will add a new saga.
A Saga is defined by a key (string) and a array of strings is persisted in the store.
You cannot erase it or delete it.
Reinjecting a saga with the same key will do nothing.

You should use injectSaga in complement with injectReducer for loading your js code asynchronously via routing.

## Injecting sagas in bulk

You can add multiple sagas at once:
```javascript
import {injectSagaBulk} from 'redux-sagas-injector';

const sagas = [
    {key: 'my_saga', saga: require('./path_to_my_saga').default},
    {key: 'my_other_saga.bar', saga: require('./path_to_my_other_saga').default},
];
injectSagaBulk(reducers);
```

## Example:


 Using the excellent [react-universal-component](https://github.com/faceyspacey/react-universal-component) library, you just have to write:
 
 ```javascript
 import universal from 'react-universal-component';
 import {injectSaga, injectReducer} from 'redux-sagas-injector';
 
 const MyComponent = universal(import(`./my_component`), {
         onLoad: (module, info, props, context) => {
             injectSaga('my-saga-key', module.saga, false, context.store);
             injectReducer('my-reducer-key', module.reducer, false, context.store);
         },
     });
 ```
 
`react-router`
 
  ```javascript
 import {injectSaga, reloadSaga, injectReducer, reloadReducer} from 'redux-sagas-injector';
 
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

## :warning: React Redux >= 6.0.0

From `react-redux@6.0.0`, there is a huge breaking change regarding the context store.
After injecting the reducer, it will not be reflected in the `mapStateToProps` method of the `connect` method from redux.
You need to decorate your connected component for explicitly updating the context store with the new injected reducer.   
For this, you can use this HOC:
``` javascript
import React, {Component} from 'react';
import {ReactReduxContext} from 'react-redux';

export default function withInjectedReducers(WrappedComponent) {
  class WithInjectedReducers extends Component {
      constructor(...args) {
          super(...args);
          this.firstRender = true;
      }

      render() {
          if (this.firstRender) {
              this.firstRender = false;
              return (
                  <ReactReduxContext.Consumer>
                      {reduxContext => (
                          <ReactReduxContext.Provider
                              value={{
                                  ...reduxContext,
                                  storeState: reduxContext.store.getState(),
                              }}
                          >
                              <WrappedComponent {...this.props} />
                          </ReactReduxContext.Provider>
                      )}
                  </ReactReduxContext.Consumer>
              );
          }
          return <WrappedComponent {...this.props} />;
      }
  }

  return WithInjectedReducers;
}

```
Use it like:
```javascript
import React from 'react';
import {connect} from 'redux';
import withInjectedReducers from './withInjectedReducers';

export reducer from './myReducerToInjectDynamically';
export saga from './mySagaToInjectDynamically';

const MyComponent = () => {
  const {title} = this.props;
  
  return <h1>{title}</h1>;
}

const mapStateToProps = state => {
  return {
      title: state.injectedReducer.title
  };
};

export default withInjectedReducers(connect(mapStateToProps)(MyComponent));
```

This piece of code is not included in this project as it uses `react` and `react-redux` dependencies. 
Feel free to use it.


If you are using `redux-sagas-injector` with `react-universal-component`, the `onLoad` method will no more populate the context as the fourth parameter.  
As explained above the context store is needed for avoiding issues in an SSR environment with concurrent calls.  
You need to pass the context yourself:


```javascript
import React, {Component} from 'react';
import universal from 'react-universal-component';
import {injectReducer, injectSaga} from 'redux-sagas-injector';
import {ReactReduxContext} from 'react-redux';

class Universal extends Component {

  render() {
      const U = universal(import('./myComponent'), {
          onLoad: (module, info, {reduxcontext}) => {
              if (reduxcontext && reduxcontext.store) {
                  injectSaga('injectedSaga', module.saga, false, reduxcontext.store);
                  injectReducer('injectedReducer', module.reducer, false, reduxcontext.store);
              }
          },
      });

      return (
          <ReactReduxContext.Consumer>
              {reduxContext => <U reduxcontext={reduxContext} />}
          </ReactReduxContext.Consumer>);
  }
}

export default Universal;
```

And if you have `react-hot-loader` installed or another HMR library, you need to add a little more abstraction:
```javascript
import React, {Component} from 'react';
import universal from 'react-universal-component';
import {injectReducer, injectSaga} from 'redux-sagas-injector';
import {ReactReduxContext} from 'react-redux';

class Universal extends Component {
  constructor(props) {
      super(props);
      this.firstRender = true;
  }

  render() {
      const U = universal(import(`./myComponent`), {
          onLoad: (module, info, {reduxcontext}) => {
              if (reduxcontext && reduxcontext.store) {
                  injectSaga('injectedSaga', module.saga, false, reduxcontext.store);
                  injectReducer('injectedReducer', module.reducer, false, reduxcontext.store);                  
              }
          },
      });

      if (this.firstRender) {
          this.firstRender = false;
          return (
              <ReactReduxContext.Consumer>
                  {reduxContext => <U reduxcontext={reduxContext} />}
              </ReactReduxContext.Consumer>);
      }

      return <U />;
  }
}

export default Universal;
```

You are now ready to support `react-redux@6.0.0` with the new Context API.
