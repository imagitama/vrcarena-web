import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
// import firebase from 'firebase/app'
import * as Sentry from '@sentry/browser'
import { ThemeProvider } from '@mui/material/styles'
// @ts-ignore
// import ReactReduxFirebaseProvider from 'react-redux-firebase/lib/ReactReduxFirebaseProvider'
import { store, history } from './store'
import App from './App'
import { inDevelopment } from './environment'
import { changeSearchTerm } from './modules/app'
import './firebase'
import './global.css'
import SupabaseClientContext from './contexts/SupabaseClient'
import { client as supabaseClient } from './supabase'
import { darkTheme } from './themes'

if (!inDevelopment()) {
  Sentry.init({
    dsn: 'https://29d780084dd844fa9884a8b3ac50fc1e@o247075.ingest.sentry.io/5249930',
  })
}

history.listen(() => {
  // @ts-ignore
  store.dispatch(changeSearchTerm())
})

// const rrfProps = {
//   firebase,
//   config: {},
//   dispatch: store.dispatch,
// }

const domNode = document.getElementById('root')
const root = createRoot(domNode!)

root.render(
  <SupabaseClientContext.Provider value={supabaseClient}>
    <Provider store={store}>
      <ConnectedRouter history={history}>
        {/* <ReactReduxFirebaseProvider {...rrfProps}> */}
        <ThemeProvider theme={darkTheme}>
          <App />
        </ThemeProvider>
        {/* </ReactReduxFirebaseProvider> */}
      </ConnectedRouter>
    </Provider>
  </SupabaseClientContext.Provider>
)

if (process.env.NODE_ENV === 'development') {
  new EventSource('/esbuild').addEventListener('change', () =>
    location.reload()
  )
}
