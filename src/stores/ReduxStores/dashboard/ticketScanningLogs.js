// imports
import { call, put, select, takeEvery } from 'redux-saga/effects'

import { getTicketLogs } from '../../../api/ticket-scanning'

// constants
export const LOAD_TICKET_SCANNING_LOGS = 'TICKET_SCANNING_LOGS:LOAD'
const TICKET_SCANNING_LOGS_LOADED = 'TICKET_SCANNING_LOGS:LOADED'

// actions
export const loadTicketScanningLogs = () => ({
  type: LOAD_TICKET_SCANNING_LOGS,
})

// initial state
const initialState = {
  status: 'loading',
  data: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TICKET_SCANNING_LOGS_LOADED:
      return {
        ...state,
        status: 'loaded',
        data: action.payload.results,
        count: action.payload.count,
      }
    default:
      return state
  }
}

function* loadTicketScanningLogsSaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const ticketScanningData = yield call(() => getTicketLogs(eventId))
  let record=0
  ticketScanningData.forEach(log => {
    log.logs && log.logs.forEach(item => {
       record++
    })})
  yield put({
    type: TICKET_SCANNING_LOGS_LOADED,
    payload: {
      results: ticketScanningData,
      count: record??0,
    },
  })
}

// sagas
function* watch() {
  yield takeEvery(LOAD_TICKET_SCANNING_LOGS, loadTicketScanningLogsSaga)
}

// exports
export default { reducer, watch }
