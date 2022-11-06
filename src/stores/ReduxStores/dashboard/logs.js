// imports
import { call, put, select, takeEvery } from 'redux-saga/effects'
import { RESET_EVENT } from './currentEvent'
import { closeDialog } from './dashboard'

import { getLogs, createLog, getAllLogs } from '../../../api/logs'

import { formatPaginatedUrl } from '../../../utils/helpers'

// constants
export const LOAD_LOGS = 'LOGS:LOAD'
export const LOAD_LOGS_OFFSET = 'LOGS:LOAD_OFFSET'
export const LOGS_LOADED = 'LOGS:LOADED'
export const LOGS_LOADED_OFFSET = 'LOGS:LOADED_OFFSET'
const LOG_UPDATED = 'LOG:UPDATED'
const LOG_REMOVED = 'LOG:REMOVED'
const ADD_ACTIVITY_LOG = 'LOG:ADD'

const LOGS_POLL = 'LOG:POLL'
const LOGS_POLL_LOADED = 'LOG:POLL_LOADED'

const CLEAR_ALL_LOGS = 'LOG:CLEAR'

// actions
export const loadLogs = onLogsLoaded => ({ type: LOAD_LOGS, onLogsLoaded })
export const pollLogs = () => ({ type: LOGS_POLL })

export const loadLogsOffset = pageNo => ({
  type: LOAD_LOGS_OFFSET,
  payload: pageNo,
})

export const addActivityLog = (message, type) => ({
  type: ADD_ACTIVITY_LOG,
  payload: { message, type },
})

export const clearLogs = () => ({ type: CLEAR_ALL_LOGS })

// initial state
const initialState = {
  status: 'loading',
  data: {},
  allLogsLoaded: false,
  loadingMore: false,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET_EVENT:
      return { ...initialState }
    case LOG_UPDATED:
      return {
        ...state,
        data: { ...state.data, [action.payload.id]: action.payload },
      }
    case LOG_REMOVED:
      return {
        ...state,
        data: { ...state.data, [action.payload.id]: undefined },
      }
    case LOAD_LOGS_OFFSET:
      return { ...state, loadingMore: true }
    case LOGS_POLL_LOADED:
      return {
        ...state,
        status: 'loaded',
        data: {
          ...state.data,
          ...action.payload.logs.reduce((map, client) => {
            // eslint-disable-next-line no-param-reassign
            map[client.object_id] = client
            return map
          }, {}),
        },
      }
    case LOGS_LOADED_OFFSET:
      return {
        ...state,
        status: 'loaded',
        nextPage: action.payload.nextPage,
        count: action.payload.count,
        data: {
          ...state.data,
          ...action.payload.logs.reduce((map, client) => {
            // eslint-disable-next-line no-param-reassign
            map[client.object_id] = client
            return map
          }, {}),
        },
        loadingMore: false,
        allLogsLoaded: action.payload.logs.length !== 100,
      }
    case LOGS_LOADED:
      return {
        ...state,
        data: {
          ...action.payload.logs.reduce((map, client) => {
            // eslint-disable-next-line no-param-reassign
            map[client.object_id] = client
            return map
          }, {}),
        },
      }
    case CLEAR_ALL_LOGS:
      return initialState
    default:
      return state
  }
}

const formatIncidentLocationLogs = logs =>
  logs.map(log => ({
    ...log,
    incident: {
      ...log?.incident,
      capture_data: {
        ...log?.incident?.capture_data,
        location: log?.incident?.capture_data?.location
          ? {
              latitude: log.incident.capture_data.location.coordinates[0],
              longitude: log.incident.capture_data.location.coordinates[1],
            }
          : null,
      },
    },
  }))

function* loadInitiallogsSaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const logs = yield call(() => getLogs(eventId, 1))

  yield put({
    type: LOGS_POLL_LOADED,
    payload: {
      logs: formatIncidentLocationLogs(logs.results),
    },
  })
}

function* loadLogsOffsetSaga({ payload }) {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const logs = yield call(() => getLogs(eventId, payload))
  const nextPage = formatPaginatedUrl(logs)

  yield put({
    type: LOGS_LOADED_OFFSET,
    payload: {
      logs: formatIncidentLocationLogs(logs.results),
      nextPage,
      count: logs.count,
    },
  })
}

function* loadAllLogsSaga({ onLogsLoaded = () => {} }) {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const logs = yield call(() => getAllLogs(eventId))

  yield put({ type: LOGS_LOADED, payload: { logs } })

  onLogsLoaded()
}

function* addActivityLogSaga({ payload: { message, type } }) {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  yield call(() => createLog(eventId, { log_message: message, log_type: type }))

  yield put(closeDialog())
}

// sagas
function* watch() {
  yield takeEvery(LOAD_LOGS, loadAllLogsSaga)
  yield takeEvery(LOGS_POLL, loadInitiallogsSaga)
  yield takeEvery(LOAD_LOGS_OFFSET, loadLogsOffsetSaga)
  yield takeEvery(ADD_ACTIVITY_LOG, addActivityLogSaga)
}

// exports
export default { reducer, watch }
