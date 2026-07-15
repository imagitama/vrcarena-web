import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'
import { createBrowserHistory as createHistory } from 'history'
import createRootReducer, { RootState } from './modules'

export const history = createHistory()

const initialState: Partial<RootState> = {}

export const store = configureStore({
  reducer: createRootReducer(history),
  preloadedState: initialState,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([thunk]),
  devTools: process.env.NODE_ENV === 'development',
})

export type AppDispatch = typeof store.dispatch

export default store
