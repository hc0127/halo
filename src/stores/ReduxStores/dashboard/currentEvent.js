// imports
import {
  call,
  all,
  put,
  take,
  takeEvery,
  select,
  fork,
} from 'redux-saga/effects'

import { LOAD_TICKET_SCANNING_LOGS } from './ticketScanningLogs'
import { LOAD_INCIDENTS, LOAD_CLOSED_INCIDENTS } from './incidents'
import {
  LOAD_LOGS,
  LOAD_LOGS_OFFSET,
  LOGS_LOADED,
  LOGS_LOADED_OFFSET,
} from './logs'
import { LOAD_STAFF } from './staff'
import { LOAD_EVENT_GEOFENCES } from './eventGeofences'
import { LOAD_STAFF_GROUPS } from './staffGroups'
import { LOAD_BANS } from './eventBans'
import { LOAD_CAPACITY_HISTORY } from './capacityHistory'
import { LOAD_CHECKS } from './eventChecks'

// api calls
import { getEvent, updateCapacityCounter } from '../../../api/events'
import { getEventsAWS } from '../../../api/ticket-scanning'

// constants
const CACHE_EVENT = 'CURRENT_EVENT:CACHE'
const RELOAD_EVENT = 'CURRENT_EVENT:RELOAD'
const EVENT_RELOADED = 'CURRENT_EVENT:RELOADED'
export const EVENT_CACHED = 'CURRENT_EVENT:CACHED'
const CLEAR_DELAYED_ACTIONS = 'CURRENT_EVENT:CLEAR_DELAYED_ACTIONS'
export const RESET_EVENT = 'CURRENT_EVENT:RESET_EVENT'
const SET_CAPACITY_COUNTER = 'CURRENT_EVENT:SET_CAPACITY_COUNTER'
const EVENT_AWS_TEST_LOADED = 'EVENT_AWS_TEST_LOADED:LOADED'
// actions
export const cacheEventId = eventId => ({
  type: CACHE_EVENT,
  payload: eventId,
})
export const resetEvent = () => ({ type: RESET_EVENT })

export const setCapacityCounter = value => ({
  type: SET_CAPACITY_COUNTER,
  payload: value,
})

export const reloadEvent = eventId => ({ type: RELOAD_EVENT, payload: eventId })

// initial state
const initialState = { event: null, delayedActions: [],eventAws:[] }

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET_EVENT:
      return { ...initialState }
    case EVENT_RELOADED:
    case EVENT_CACHED:
      return { ...state, event: action.payload }
    case LOAD_TICKET_SCANNING_LOGS:
    case LOAD_INCIDENTS:
    case LOAD_CLOSED_INCIDENTS:
    case LOAD_LOGS:
    case LOAD_LOGS_OFFSET:
    case LOAD_CHECKS:
    case LOAD_STAFF:
    case LOAD_EVENT_GEOFENCES:
    case LOAD_STAFF_GROUPS:
    case LOAD_BANS:
    case LOAD_CAPACITY_HISTORY:
      return { ...state, delayedActions: [...state.delayedActions, action] }
    case CLEAR_DELAYED_ACTIONS:
      return { ...state, delayedActions: [] }
    case EVENT_AWS_TEST_LOADED:
      return {
          ...state,
          status: 'loaded',
          eventAws: action.payload.results,
      }
    default:
      return state
  }
}

function* setCapacityCounterSaga({ payload: value }) {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const event = yield call(() => updateCapacityCounter(eventId, value))
  yield put({ type: EVENT_CACHED, payload: event })
}

function* cacheEventSaga({ payload: eventId }) {
  
  const event = yield call(() => getEvent(eventId))
  let ticketScanningAWS=[]
  if(event?.client.enabled_features.includes('ticketScanning')){
    ticketScanningAWS = yield call(() => getEventsAWS(eventId))
  }
  
  // yield fork(subscribe, event)
  yield put({
    type: EVENT_AWS_TEST_LOADED,
    payload: {
      results: ticketScanningAWS,
    },
  })
  yield put({ type: EVENT_CACHED, payload: event })

  // Because caching the event will take time,
  // some of the actions (for loading) which requires it will have already been dispatched and ignored because of the lack of event
  // to solve this, we store all the load actions under the array "delayedActions" so we can dispatch them again
  // this is not a great way of solving the issue but it makes everything else (apart from this saga) more simple!
  // also it reduces the number of calls we have to make to load event details
  const delayedActions = yield select(
    state => state.currentEvent.delayedActions,
  )

  /* for remembering actions by idx */
  // yield put(delayedActions[0]) // geofences
  // yield put(delayedActions[2]) // incidents
  // yield put(delayedActions[5]) // staff
  // yield put(delayedActions[3]) // logs
  // yield put(delayedActions[1]) // staff groups

  yield all(delayedActions.map(action => put(action)))

  yield put({ type: CLEAR_DELAYED_ACTIONS })

  // add a signin log after the loags have been loaded
  yield fork(function*() {
    yield take(LOGS_LOADED)
  })

  yield fork(function*() {
    yield take(LOGS_LOADED_OFFSET)
  })
}

function* reloadEventSaga({ payload: eventId }) {
  const event = yield call(() => getEvent(eventId))

  yield put({ type: EVENT_RELOADED, payload: event })
}

// sagas
function* watch() {
  yield takeEvery(CACHE_EVENT, cacheEventSaga)
  yield takeEvery(SET_CAPACITY_COUNTER, setCapacityCounterSaga)
  yield takeEvery(RELOAD_EVENT, reloadEventSaga)
}

// exports
export default { reducer, watch }
