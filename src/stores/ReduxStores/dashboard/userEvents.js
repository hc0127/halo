// imports
import { call, put, takeEvery } from 'redux-saga/effects'
import { UPDATED_LOGIN_USER } from '../auth'

import { getUserEvents } from '../../../api/users'

// constants
const LOAD_USER_EVENTS = 'USER_EVENTS:LOAD'
const USER_EVENTS_LOADED = 'USER_EVENTS:LOADED'

// actions
export const loadUserEvents = () => ({ type: LOAD_USER_EVENTS })

// initial state
const initialState = {
  list: [],
  suspended: false,
  status: 'loading',
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_EVENTS_LOADED:
      return {
        ...state,
        status: 'loaded',
        list: action.payload.events,
        suspended: action.payload.suspended,
      }
    default:
      return state
  }
}

function* loadUserEventsSaga() {
  const events = yield call(() => getUserEvents())

  yield put({ type: USER_EVENTS_LOADED, payload: { events } })
}

// sagas
function* watch() {
  yield takeEvery(LOAD_USER_EVENTS, loadUserEventsSaga)
  yield takeEvery(UPDATED_LOGIN_USER, loadUserEventsSaga)
}

// exports
export default { reducer, watch }
