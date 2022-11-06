// imports
import { takeEvery, put, select } from 'redux-saga/effects'
import moment from 'moment'
import { addActivityLog, LOGS_LOADED_OFFSET } from './logs'
import { LOGGED_OUT } from '../auth'

// constants
const OFFSET_NUMBER = 1
const OFFSET_UNIT = 'hours'

const getTimeStamp = () =>
  JSON.parse(window.localStorage.getItem('userTimeStamp')) || {}

function* addTimestampToLocalStorage() {
  const event = yield select(store => store.currentEvent.event)

  if (!event) return

  const { id: eventId } = event

  const timestamp = getTimeStamp()

  timestamp[eventId] = new Date().toISOString()
  window.localStorage.setItem('userTimeStamp', JSON.stringify(timestamp))
}

function* addActivityLogIfUserInactive() {
  const eventId = yield select(store => store.currentEvent.event.id)
  const {
    currentUser: { name },
  } = yield select(state => state.auth)
  const timestamp = getTimeStamp()

  if (
    !timestamp ||
    !timestamp[eventId] ||
    moment(timestamp[eventId]).isBefore(
      moment().subtract(OFFSET_NUMBER, OFFSET_UNIT),
    )
  ) {
    yield takeEvery('*', addTimestampToLocalStorage)
    yield put(addActivityLog(`${name} has just logged in`, 'signin'))
  }
}

function clearTimestamps() {
  window.localStorage.removeItem('userTimeStamp')
}

function* watch() {
  yield takeEvery(LOGS_LOADED_OFFSET, addActivityLogIfUserInactive)
  yield takeEvery(LOGGED_OUT, clearTimestamps)
}

// exports
export default { watch }
