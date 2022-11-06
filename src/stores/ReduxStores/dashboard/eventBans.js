// imports
import { call, put, select, takeLatest } from 'redux-saga/effects'
import { closeSlidingView, confirmDialogSaga } from './dashboard'

import {
  getEventBans,
  updateEventBan,
  deleteEventBan,
} from '../../../api/events'

// constants
export const LOAD_BANS = 'BANS:LOAD'
export const BANS_LOADED = 'BANS:LOADED'
export const EDIT_BAN = 'BAN:EDIT'
export const DELETE_BAN = 'BAN:DELETE'

// actions
export const loadBans = () => ({ type: LOAD_BANS })
export const saveBan = (banId, values) => ({
  type: EDIT_BAN,
  payload: { banId, values },
})
export const deleteBan = banId => ({ type: DELETE_BAN, payload: { banId } })

// initial state
const initialState = {
  status: 'loading',
  list: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case BANS_LOADED:
      return { ...state, list: action.payload, status: 'loaded' }
    default:
      return state
  }
}

function* loadBansSaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const bans = yield call(() => getEventBans(eventId))
  yield put({ type: BANS_LOADED, payload: bans })
}

function* deleteBanSaga({ payload: { banId } }) {
  if (
    !(yield confirmDialogSaga(
      'Are you sure?',
      'Are you sure you wish to delete this ban? This action is irreversible',
      'Confirm',
    ))
  ) {
    return
  }

  yield call(() => deleteEventBan(banId))

  yield loadBansSaga()
}

function* saveBanSaga({ payload: { banId, values } }) {
  yield call(() => updateEventBan(banId, values))

  yield loadBansSaga()

  yield put(closeSlidingView())
}

// sagas
function* watch() {
  yield takeLatest(LOAD_BANS, loadBansSaga)
  yield takeLatest(DELETE_BAN, deleteBanSaga)
  yield takeLatest(EDIT_BAN, saveBanSaga)
}

// exports
export default { reducer, watch }
