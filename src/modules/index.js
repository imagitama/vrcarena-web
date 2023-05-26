import { combineReducers } from 'redux'
import { firebaseReducer } from 'react-redux-firebase'
import { connectRouter } from 'connected-react-router'
import user from './user'
import app from './app'

export default history =>
  combineReducers({
    user,
    app,
    firebase: firebaseReducer,
    router: connectRouter(history)
  })
