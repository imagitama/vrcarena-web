import { createStore, applyMiddleware, compose, Store } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk'
import { createBrowserHistory as createHistory } from 'history'
import createRootReducer, { RootState } from './modules'

export const history = createHistory()

const initialState: Partial<RootState> = {}
const enhancers = []
const middleware = [thunk, routerMiddleware(history)]

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension())
  }
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers)

export const store: Store<RootState> = createStore(
  createRootReducer(history),
  initialState as RootState,
  composedEnhancers
)

export default store
