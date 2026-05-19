import { createStore, applyMiddleware, Store, StoreEnhancer, compose } from 'redux'
import thunk from 'redux-thunk'
import { createBrowserHistory as createHistory } from 'history'
import createRootReducer, { RootState } from './modules'

export const history = createHistory()

const initialState: Partial<RootState> = {}

const devTools: StoreEnhancer =
  process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    : (f: any) => f

export const store: Store<RootState> = createStore(
  createRootReducer(history),
  initialState,
  compose(applyMiddleware(thunk), devTools) as StoreEnhancer
)

export default store
