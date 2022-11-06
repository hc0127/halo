// imports
import { call, put, select, takeLatest } from 'redux-saga/effects'

import { getEventCapacityHistory } from '../../../api/events'

// constants
export const LOAD_CAPACITY_HISTORY = 'CAPACITY_HISTORY:LOAD'
const CAPACITY_HISTORY_LOADED = 'CAPACITY_HISTORY:LOADED'

// actions
export const loadCapacityHistory = () => ({ type: LOAD_CAPACITY_HISTORY })

// initial state
const initialState = {
  status: 'loading',
  list: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CAPACITY_HISTORY_LOADED:
      return { ...state, list: action.payload, status: 'loaded' }
    default:
      return state
  }
}

function* loadCapacityHistorySaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)

  const capacityHistory = yield call(() => getEventCapacityHistory(eventId))

  yield put({ type: CAPACITY_HISTORY_LOADED, payload: capacityHistory })
}

// sagas
function* watch() {
  yield takeLatest(LOAD_CAPACITY_HISTORY, loadCapacityHistorySaga)
}

// exports
export default { reducer, watch }
