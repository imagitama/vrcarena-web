import { combineReducers } from 'redux'
import { firebaseReducer } from 'react-redux-firebase'
import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import user from './user'
import app from './app'

export default (history: History) =>
  combineReducers({
    user,
    app,
    firebase: firebaseReducer,
    router: connectRouter(history),
  })
