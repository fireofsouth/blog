(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MyBundle = {}));
}(this, (function (exports) { 'use strict';

  function createStore(
    reducer,
    initState,
    rewriteCreateStoreFunc
  ) {
    if (rewriteCreateStoreFunc) {
      const newCreateStore = rewriteCreateStoreFunc(createStore);
      return newCreateStore(reducer, initState);
    }

    let state = initState;
    let listeners = [];
    function subscribe(listener) {
      listeners.push(listener);
    }
    function getState() {
      return state;
    }

    function dispatch(action) {
      state = reducer(state, action);
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        listener();
      }
    }
    function replaceReducer(nextReducer) {
      reducer = nextReducer;
      dispatch({ type: Symbol() });
    }
    dispatch({ type: Symbol() });
    return {
      subscribe,
      getState,
      dispatch,
      replaceReducer
    };
  }

  function combineReducers(reducers) {
      const reducerKeys = Object.keys(reducers);
      return function combineActions(state = {}, action) {
          const nextState = {};
          for (let i = 0; i < reducerKeys.length; i++) {
              const key = reducerKeys[i];
              const reducer = reducers[key];
              const previousStateForKey = state[key];
              const nextStateForKey = reducer(previousStateForKey, action);
              nextState[key] = nextStateForKey;
          }
          return nextState;
      };
  }

  let initState = {
      count: 0,
  };
  function counterReducer(state, action) {
      if (!state) {
          state = initState;
      }
      switch (action.type) {
          case 'INCREMENT':
              return {
                  ...state,
                  count: state.count + 1,
              };
          case 'DECREMENT':
              return {
                  ...state,
                  count: state.count - 1,
              };
          default:
              return state;
      }
  }

  let initState$1 = {
      name: '初始名字',
      description: '初始描述',
  };

  function infoReducer(state, action) {
      if (!state) {
          state = initState$1;
      }
      switch (action.type) {
          case 'SET_NAME':
              return {
                  ...state,
                  name: action.name,
              };
          case 'SET_DESCRIPTION':
              return {
                  ...state,
                  description: action.description,
              };
          default:
              return state;
      }
  }

  const exceptionMiddleware = (store) => (next) => (action) => {
    try {
      next(action);
    } catch (e) {
      console.log('错误报告', e);
    }
  };

  const loggerMiddleware = (store) => (next) => (action) => {
    console.log('this state', store.getState());
    console.log('action', action);
    next(action);
    console.log('next state', store.getState());
  };

  const timeMiddleware = (store) => (next) => (action) => {
    console.log('⏰', new Date().getTime());
    next(action);
  };

  //函数组合
  function compose(...funcs) {
    if (funcs.length == 0) {
      return (arg) => arg;
    }
    if (funcs.length == 1) {
      return funcs[0];
    }
    return funcs.reduce((a, b) => {
      return (...args) => a(b(...args));
    });
  }

  const applyMiddleware = function (...middlewares) {
    return function (oldCreateStore) {
      return function (reducer, initState) {
        const store = oldCreateStore(reducer, initState);
        const simpleStore = { getState: store.getState };
        const chain = middlewares.map((middleware) => middleware(simpleStore));
        const dispatch = compose(...chain)(store.dispatch);
        return {
          ...store,
          dispatch
        };
      };
    };
  };

  exports.applyMiddleware = applyMiddleware;
  exports.combineReducers = combineReducers;
  exports.counterReducer = counterReducer;
  exports.createStore = createStore;
  exports.exceptionMiddleware = exceptionMiddleware;
  exports.infoReducer = infoReducer;
  exports.loggerMiddleware = loggerMiddleware;
  exports.timeMiddleware = timeMiddleware;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
