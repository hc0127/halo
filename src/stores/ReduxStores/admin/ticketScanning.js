// imports
import { call, put, takeEvery } from 'redux-saga/effects'

// api calls
import {
  getTicketScanningSettings,
  getTicketScanningSettingsClient,
  createTicketScanningSetting,
} from '../../../api/ticket-scanning'

// constants
const LOAD_TICKET_SCANNING = 'TICKET_SCANNING:LOAD'
const TICKET_SCANNING_LOADED = 'TICKET_SCANNING:LOADED'
const SAVE_TICKET_SCANNING = 'TICKET_SCANNING:SAVE'
const TICKET_SCANNING_SAVED = 'TICKET_SCANNING:SAVED'
const TICKET_SCANNING_FAIL = 'TICKET_SCANNING:FAIL'

// actions
export const loadTicketScanningSettings = clientId => ({
  type: LOAD_TICKET_SCANNING,
  payload: { clientId },
})
export const saveTicketScanningSettings = form => ({
  type: SAVE_TICKET_SCANNING,
  payload: form,
})

// initial state
const initialState = {
  status: 'loading',
  data: null,
  extraData: { clientImportSettings: {} },
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case TICKET_SCANNING_LOADED:
      return {
        ...state,
        status: 'loaded',
        data: action.payload,
      }
    case SAVE_TICKET_SCANNING:
      return { ...state, status: 'saving' }
    case TICKET_SCANNING_SAVED:
      return { ...state, status: 'saved' }
    case TICKET_SCANNING_FAIL:
      return { ...state, status: 'failed', data: null }
    default:
      return state
  }
}

export function* loadTicketScanningSettingsSaga({ payload: { clientId } }) {
  yield put({ type: TICKET_SCANNING_LOADED, payload: null })
  let settings
  try {
    settings = yield call(() =>
      clientId
        ? getTicketScanningSettingsClient(clientId)
        : getTicketScanningSettings(),
    )
    yield put({ type: TICKET_SCANNING_LOADED, payload: settings })
  } catch (err) {
    yield put({ type: TICKET_SCANNING_FAIL })
  }
}

function* saveTicketScanningSettingsSaga({
  payload: { importType, importCredentials, clientId },
}) {
  yield call(() =>
    createTicketScanningSetting(clientId, {
      client: clientId,
      credentials: { ...importCredentials },
      import_type: importType,
    }),
  )
  yield loadTicketScanningSettingsSaga({ payload: { clientId } })
}

// sagas
function* watch() {
  yield takeEvery(LOAD_TICKET_SCANNING, loadTicketScanningSettingsSaga)
  yield takeEvery(SAVE_TICKET_SCANNING, saveTicketScanningSettingsSaga)
}

// exports
export default { reducer, watch }
