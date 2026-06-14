import { createStore, applyMiddleware, Store, StoreEnhancer, compose } from 'redux'
import thunk from 'redux-thunk'
import { createBrowserHistory as createHistory } from 'history'
import createRootReducer, { RootState } from './modules'
import { configureStore } from '@reduxjs/toolkit'

export const history = createHistory()

const initialState: Partial<RootState> = {}

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const devTools =
  process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    : (f: any) => f

// export const store = createStore(
//   createRootReducer(history),
//   initialState,
//   composeEnhancers(applyMiddleware(thunk), devTools)
// )

export const store = configureStore({
  reducer: createRootReducer(history),
  preloadedState: initialState,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV === 'development',
})

export type AppDispatch = typeof store.dispatch

export default store
