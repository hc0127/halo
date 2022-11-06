// imports
import { put, takeEvery } from 'redux-saga/effects'
import moment from 'moment'

// constants
const LOAD_SERVER_TIME = 'SERVER_TIME:LOAD'
const SERVER_TIME_LOADED = 'SERVER_TIME:LOADED'

// actions
export const loadServerTime = () => ({ type: LOAD_SERVER_TIME })
export const serverTimeLoaded = time => ({
  type: SERVER_TIME_LOADED,
  payload: moment(time),
})

// initial state
const initialState = {
  value: null,
  status: 'loading',
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SERVER_TIME:
      return { ...state, status: 'loading' }
    case SERVER_TIME_LOADED:
      return { ...state, status: 'loaded', value: action.payload }
    default:
      return state
  }
}

function* loadServerTimeSaga() {
  const serverTime = new Date().toLocaleTimeString()

  yield put(serverTimeLoaded(serverTime))
}

// sagas
function* watch() {
  yield takeEvery(LOAD_SERVER_TIME, loadServerTimeSaga)
}

// selectors

// exports
export default { reducer, watch }
