import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import user, { UserState } from './user'
import app, { AppState } from './app'
import firebase, { FirebaseState } from './firebase'

export interface RootState {
  user: UserState
  app: AppState
  firebase: FirebaseState
  router: ReturnType<typeof connectRouter>
}

const createRootReducer = (history: History) =>
  combineReducers<RootState>({
    user,
    app,
    firebase,
    // @ts-ignore cbf fixing
    router: connectRouter(history),
  })

export default createRootReducer
