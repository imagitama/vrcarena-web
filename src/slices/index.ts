import { combineReducers } from 'redux'
import { History } from 'history'
import user, { UserState } from './user'
import app, { AppState } from './app'
import firebase, { FirebaseState } from './firebase'
import {
  reducer as globalStateReducer,
  GlobalStateSlice,
} from '../slices/globalState'

export interface RootState {
  user: UserState
  app: AppState
  firebase: FirebaseState
  globalState: GlobalStateSlice
}

const createRootReducer = (history: History) =>
  combineReducers({
    user,
    app,
    firebase,
    globalState: globalStateReducer,
  })

export default createRootReducer
