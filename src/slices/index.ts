import { combineReducers } from 'redux'
import { History } from 'history'
import user, { UserState } from './user'
import app, { AppState } from './app'
import {
  reducer as globalStateReducer,
  GlobalStateSlice,
} from '../slices/globalState'

export interface RootState {
  user: UserState
  app: AppState
  globalState: GlobalStateSlice
}

const createRootReducer = (history: History) =>
  combineReducers({
    user,
    app,
    globalState: globalStateReducer,
  })

export default createRootReducer
