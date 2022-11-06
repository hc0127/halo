// imports
import { call, put, select, takeEvery } from 'redux-saga/effects'
import { RESET_EVENT } from './currentEvent'
import utils from '../../../utils/helpers'

// api calls
import { getEventGeoFences } from '../../../api/events'

// constants
export const LOAD_EVENT_GEOFENCES = 'EVENT_GEOFENCES:LOAD'
const EVENT_GEOFENCES_LOADED = 'EVENT_GEOFENCES:LOADED'
export const EVENT_GEOFENCES_UPDATED = 'EVENT_GEOFENCES:UPDATED'
const EVENT_GEOFENCES_DELETED = 'EVENT_GEOFENCES:DELETED'

// actions
export const loadEventGeofences = () => ({ type: LOAD_EVENT_GEOFENCES })

// initial state
const initialState = {
  status: 'loading',
  list: [],
}

const reducer = (state = initialState, action) => {
  let tempList = state.list
  switch (action.type) {
    case RESET_EVENT:
      return { ...initialState }
    case EVENT_GEOFENCES_LOADED:
      return { ...state, status: 'loaded', list: action.payload }
    case EVENT_GEOFENCES_UPDATED:
      tempList = tempList
        .filter(geofence => geofence.id !== action.payload.id)
        .concat(action.payload)
      return { ...state, list: tempList }
    case EVENT_GEOFENCES_DELETED:
      tempList = tempList.filter(geofence => geofence.id !== action.payload.id)
      return { ...state, list: tempList }
    default:
      return state
  }
}

function* loadEventGeoFencesSaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const eventGeofences = yield call(() => getEventGeoFences(eventId))
  const formattedGeofences = eventGeofences.map(geofence => ({
    ...geofence,
    id: geofence.object_id,
    points: utils.formatPoints(geofence.points.coordinates),
  }))
  yield put({ type: EVENT_GEOFENCES_LOADED, payload: formattedGeofences })
}

// sagas
function* watch() {
  yield takeEvery(LOAD_EVENT_GEOFENCES, loadEventGeoFencesSaga)
}

// exports
export default { reducer, watch }
