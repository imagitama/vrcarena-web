import { combineReducers } from 'redux'
import { History } from 'history'
import user, { UserState } from './user'
import app, { AppState } from './app'
import firebase, { FirebaseState } from './firebase'

export interface RootState {
  user: UserState
  app: AppState
  firebase: FirebaseState
}

const createRootReducer = (history: History) =>
  combineReducers<RootState>({
    user,
    app,
    firebase,
  })

export default createRootReducer
