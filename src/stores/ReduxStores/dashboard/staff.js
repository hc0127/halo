// imports
import { call, put, select, takeEvery } from 'redux-saga/effects'
import { RESET_EVENT } from './currentEvent'
import utils from '../../../utils/helpers'

// api calls
import { getEventStaff } from '../../../api/events'

// constants
export const LOAD_STAFF = 'STAFF:LOAD'
const STAFF_LOADED = 'STAFF:LOADED'
const STAFF_UPDATED = 'STAFF:UPDATED'
export const STAFF_REMOVED = 'STAFF:REMOVED'

// actions
export const loadStaff = () => ({ type: LOAD_STAFF })

// initial state
const initialState = {
  status: 'loading',
  data: {},
}

const reducer = (state = initialState, action) => {
  let tempStaff
  switch (action.type) {
    case RESET_EVENT:
      return { ...initialState }
    case STAFF_UPDATED:
      return {
        ...state,
        data: { ...state.data, [action.payload.id]: action.payload },
      }
    case STAFF_REMOVED:
      tempStaff = { ...state.data }
      delete tempStaff[action.payload.id]
      return { ...state, data: tempStaff }
    case STAFF_LOADED:
      return {
        ...state,
        status: 'loaded',
        data: action.payload.reduce(
          (map, client) => ({ ...map, [client.object_id]: client }),
          {},
        ),
      }
    default:
      return state
  }
}

function* loadStaffSaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const staff = yield call(() => getEventStaff(eventId))
  const formattedStaff = utils
    .sort(staff, user => user.name, 'asc')
    .map(staff => ({ ...staff, pin: staff.pin.toLowerCase() }))
  yield put({ type: STAFF_LOADED, payload: formattedStaff })
}

// sagas
function* watch() {
  yield takeEvery(LOAD_STAFF, loadStaffSaga)
}

// exports
export default { reducer, watch }
