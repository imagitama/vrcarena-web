/// <reference types="webpack-env" />
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import firebase from 'firebase/app'
import * as Sentry from '@sentry/browser'
// @ts-ignore
import ReactReduxFirebaseProvider from 'react-redux-firebase/lib/ReactReduxFirebaseProvider'
import { store, history } from './store'
import App from './App'
import { inDevelopment } from './environment'
import { changeSearchTerm } from './modules/app'
import './firebase'
import './global.css'
import SupabaseClientContext from './contexts/SupabaseClient'
import { client as supabaseClient } from './supabase'

if (!inDevelopment()) {
  Sentry.init({
    dsn: 'https://29d780084dd844fa9884a8b3ac50fc1e@o247075.ingest.sentry.io/5249930',
  })
}

history.listen(() => {
  // @ts-ignore
  store.dispatch(changeSearchTerm())
})

const target = document.querySelector('#root')

const rrfProps = {
  firebase,
  config: {},
  dispatch: store.dispatch,
}

const render = (Component: React.FunctionComponent) =>
  ReactDOM.render(
    <SupabaseClientContext.Provider value={supabaseClient}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <ReactReduxFirebaseProvider {...rrfProps}>
            <Component />
          </ReactReduxFirebaseProvider>
        </ConnectedRouter>
      </Provider>
    </SupabaseClientContext.Provider>,
    target
  )

render(App)

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default
    render(NextApp)
  })
}
