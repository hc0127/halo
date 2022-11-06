// imports
import { call, put, takeEvery } from 'redux-saga/effects'

// api calls
import {
  getGeoFences,
  createGeoFence,
  updateGeoFence,
  deleteGeoFence,
} from '../../../api/geofence'

import utils from '../../../utils/helpers'

// constants
export const LOAD_GEOFENCES = 'GEOFENCES:LOAD'
export const GEOFENCES_LOADED = 'GEOFENCES:LOADED'
export const SAVE_EVENT_GEOFENCES = 'GEOFENCES:EVENT_SAVE'
export const EVENT_GEOFENCES_SAVED = 'GEOFENCES:EVENT_SAVED'

// actions
export const loadGeoFencesAction = () => ({ type: LOAD_GEOFENCES })

// initial state
const initialState = {
  status: 'loading',
  list: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_GEOFENCES:
      return { ...state, status: 'loading' }
    case GEOFENCES_LOADED:
      return {
        ...state,
        status: 'loaded',
        list: action.payload,
      }
    case SAVE_EVENT_GEOFENCES:
      return { ...state, status: 'saving' }
    case EVENT_GEOFENCES_SAVED:
      return { ...state, status: 'saved' }
    default:
      return state
  }
}

function* loadGeoFencesSaga() {
  const { results: geofences } = yield call(() => getGeoFences())
  const formattedGeoFences = geofences.map(
    ({ object_id, name, points, event }) => ({
      id: object_id,
      name,
      event,
      points: utils.formatPoints(points.coordinates),
    }),
  )

  yield put({ type: GEOFENCES_LOADED, payload: formattedGeoFences })
}

function* saveEventGeofencesSaga({
  payload: { event, initialGeoFences, mutatedGeoFences },
}) {
  const deletedGeoFences = initialGeoFences.filter(
    initialGeoFence =>
      !mutatedGeoFences.some(
        mutatedGeoFence =>
          mutatedGeoFence.object_id === initialGeoFence.object_id,
      ),
  )

  const reverseEngineeredPoints = mutatedGeoFences.map(geofence =>
    geofence.points.map(point => [point.latitude, point.longitude]),
  )

  const formattedGeoFences = mutatedGeoFences.map((geofence, idx) => ({
    ...geofence,
    points: {
      type: 'MultiPoint',
      coordinates: reverseEngineeredPoints[idx],
    },
  }))

  for (let idx in formattedGeoFences) {
    const geofence = formattedGeoFences[idx]
    if (geofence.object_id) {
      yield call(() => updateGeoFence(geofence))
    } else {
      createGeoFence({ ...geofence, event_id: event })
    }
  }

  if (deletedGeoFences.length) {
    for (let idx in deletedGeoFences) {
      yield call(() => deleteGeoFence(deletedGeoFences[idx].object_id))
    }
  }

  // yield put({ type: LOAD_GEOFENCES })
  // yield take(GEOFENCES_LOADED)

  yield put({ type: EVENT_GEOFENCES_SAVED })
}

// sagas
function* watch() {
  yield takeEvery(LOAD_GEOFENCES, loadGeoFencesSaga)
  yield takeEvery(SAVE_EVENT_GEOFENCES, saveEventGeofencesSaga)
}

// exports
export default { reducer, watch }
