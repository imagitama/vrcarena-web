import { combineReducers } from 'redux'
import { FirebaseReducer, firebaseReducer } from 'react-redux-firebase'
import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import user, { UserState } from './user'
import app, { AppState } from './app'

export interface RootState {
  user: UserState
  app: AppState
  firebase: FirebaseReducer.Reducer
  router: ReturnType<typeof connectRouter>
}

const createRootReducer = (history: History) =>
  combineReducers<RootState>({
    user,
    app,
    firebase: firebaseReducer,
    // @ts-ignore cbf fixing
    router: connectRouter(history),
  })

export default createRootReducer
