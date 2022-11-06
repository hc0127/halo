import './utils/momentExtensions'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'

import App from './App'
import configureStore, { history } from './stores/ReduxStore'

import AppsyncProvider from './appsync-service/appsyncProvider'

const reduxStore = configureStore()

ReactDOM.render(
  <AppsyncProvider>
    <Provider store={reduxStore}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>
  </AppsyncProvider>,
  document.getElementById('root'),
)
