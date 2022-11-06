import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { all, take, fork, cancel, cancelled } from 'redux-saga/effects'

import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createBrowserHistory } from 'history'
import createSagaMiddleware from 'redux-saga'

import Parse from 'parse'

import {
  reducer as incidentFormReducer,
  watchForms as watchIncidentForms,
} from './ReduxStores/dashboard/incidentForm'
import clients from './ReduxStores/admin/clients'
import activeEvent from './ReduxStores/admin/activeEvent'
import events from './ReduxStores/admin/events'
import users from './ReduxStores/admin/users'
import dialog from './ReduxStores/dialog'
import geofences from './ReduxStores/admin/geofences'
import customIncidentTypes from './ReduxStores/admin/customIncidentTypes'
import groups from './ReduxStores/admin/groups'
import currentEvent, {
  EVENT_CACHED,
  RESET_EVENT,
} from './ReduxStores/dashboard/currentEvent'
import incidents from './ReduxStores/dashboard/incidents'
import logs from './ReduxStores/dashboard/logs'
import ticketScanningLogs from './ReduxStores/dashboard/ticketScanningLogs'
import staff from './ReduxStores/dashboard/staff'
import eventChecks from './ReduxStores/dashboard/eventChecks'
import eventGeofences from './ReduxStores/dashboard/eventGeofences'
import dashboard from './ReduxStores/dashboard/dashboard'
import staffGroups from './ReduxStores/dashboard/staffGroups'
import auth from './ReduxStores/auth'
import userEvents from './ReduxStores/dashboard/userEvents'
import errors from './ReduxStores/errors'
import admin from './ReduxStores/admin/admin'
import eventBans from './ReduxStores/dashboard/eventBans'
import capacityHistory from './ReduxStores/dashboard/capacityHistory'
import activityLogUserLogin from './ReduxStores/dashboard/activityLogUserLogin'
import serverTime from './ReduxStores/dashboard/serverTime'
import incidentMessages from './ReduxStores/dashboard/incidentMessages'
import eventCheckMessages from './ReduxStores/dashboard/eventCheckMessages'
import userViews from './ReduxStores/dashboard/userViews'
import ticketScanning from './ReduxStores/admin/ticketScanning'
import ticketImportLogs from './ReduxStores/admin/ticketImportLogs'
import adminChecks from './ReduxStores/admin/adminChecks'
import beacondetails from './ReduxStores/admin/beacondetails'

import { SERVER } from '../settings'

export const history = createBrowserHistory()

const appReducer = combineReducers({
  router: connectRouter(history),
  incidentForm: incidentFormReducer,
  clients: clients.reducer,
  ticketScanning: ticketScanning.reducer,
  ticketImportLogs: ticketImportLogs.reducer,
  activeEvent: activeEvent.reducer,
  events: events.reducer,
  users: users.reducer,
  customIncidentTypes: customIncidentTypes.reducer,
  dialog: dialog.reducer,
  geofences: geofences.reducer,
  eventChecks: eventChecks.reducer,
  adminChecks: adminChecks.reducer,
  groups: groups.reducer,
  currentEvent: currentEvent.reducer,
  incidents: incidents.reducer,
  logs: logs.reducer,
  ticketScanningLogs: ticketScanningLogs.reducer,
  staff: staff.reducer,
  eventGeofences: eventGeofences.reducer,
  dashboard: dashboard.reducer,
  staffGroups: staffGroups.reducer,
  auth: auth.reducer,
  userEvents: userEvents.reducer,
  errors: errors.reducer,
  admin: admin.reducer,
  eventBans: eventBans.reducer,
  capacityHistory: capacityHistory.reducer,
  serverTime: serverTime.reducer,
  incidentMessages: incidentMessages.reducer,
  eventCheckMessages: eventCheckMessages.reducer,
  userViews: userViews.reducer,
  beacondetails: beacondetails.reducer,
  debug: (state, action) => {
    console.debug(action.type, action.payload)
    return null
  },
})

const rootReducer = (state, action) => {
  if (action.type === 'AUTH:LOGGED_OUT') {
    return appReducer(undefined, action)
  }

  return appReducer(state, action)
}

function* loadOneEvent() {
  try {
    yield all([
      watchIncidentForms(),
      ticketScanningLogs.watch(),
      incidents.watch(),
      logs.watch(),
      staff.watch(),
      eventChecks.watch(),
      eventGeofences.watch(),
      dashboard.watch(),
      staffGroups.watch(),
      eventBans.watch(),
      capacityHistory.watch(),
      incidentMessages.watch(),
      eventCheckMessages.watch(),
      userViews.watch(),
    ])
  } finally {
    if (yield cancelled()) {
      console.debug('EVENT_UNLOADED')
    }
  }
}

function* rootSaga() {
  try {
    const { appKey, javascriptKey, parseServerURL } = SERVER

    Parse.initialize(appKey, javascriptKey)
    Parse.serverURL = parseServerURL

    yield fork(currentEvent.watch)

    // load only 1 event, never more, never less
    yield fork(function*() {
      while (yield take(EVENT_CACHED)) {
        const task = yield fork(loadOneEvent)

        yield take(RESET_EVENT)

        yield cancel(task)
      }
    })

    yield all([
      clients.watch(),
      ticketScanning.watch(),
      ticketImportLogs.watch(),
      activeEvent.watch(),
      events.watch(),
      users.watch(),
      customIncidentTypes.watch(),
      dialog.watch(),
      geofences.watch(),
      adminChecks.watch(),
      groups.watch(),
      userEvents.watch(),
      errors.watch(),
      admin.watch(),
      activityLogUserLogin.watch(),
      serverTime.watch(),
      auth.watch(),
      beacondetails.watch(),
    ])
  } catch (err) {
    if (
      window.prompt(
        'Sorry, there was an error. Press ok to Refresh.',
        `ERROR:${JSON.stringify(err.config.method)} : ${JSON.stringify(
          err.config.url,
        )} ${JSON.stringify(err.status)} 
${JSON.stringify(err.data)}`,
      )
    ) {
      window.location.reload(false)
    }
  }
}

export default function configureStore() {
  const sagaMiddleware = createSagaMiddleware()
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const store = createStore(
    rootReducer,
    composeEnhancers(
      applyMiddleware(routerMiddleware(history), sagaMiddleware),
    ),
  )

  sagaMiddleware.run(rootSaga)

  return store
}
