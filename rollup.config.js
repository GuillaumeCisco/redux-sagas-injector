import pkg from './package.json';

export default [
  {
    input: 'src/redux-sagas-injector.js',
    external: ['redux-reducers-injector-forked', 'redux', 'redux-saga', 'redux-saga/effects'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  },
];
