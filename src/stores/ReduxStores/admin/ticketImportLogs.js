// imports
import { call, put, takeEvery } from 'redux-saga/effects'

import { getTicketImportLog } from '../../../api/ticket-scanning'

// constants
const GET_TICKET_IMPORT_LOG = 'GET:TICKET_IMPORT_LOG'
const TICKET_IMPORT_LOG_LOADED = 'LOADED:TICKET_IMPORT_LOG'

// actions
export const loadTicketImportLog = eventId => ({
  type: GET_TICKET_IMPORT_LOG,
  payload: { eventId },
})

// initial state
const initialState = {
  status: '',
  finished_at: '',
  hasTicketLog: false,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TICKET_IMPORT_LOG_LOADED:
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}

function* loadTicketImportLogSaga({ payload: { eventId } }) {
  const { status, finished_at } = yield call(() => getTicketImportLog(eventId))

  yield put({
    type: TICKET_IMPORT_LOG_LOADED,
    payload: {
      status,
      finished_at,
      hasTicketLog: Boolean(status && finished_at),
    },
  })
}

// sagas
function* watch() {
  yield takeEvery(GET_TICKET_IMPORT_LOG, loadTicketImportLogSaga)
}

// exports
export default { reducer, watch }
