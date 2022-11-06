// imports
import { call, put, takeEvery } from 'redux-saga/effects'

//Api call
import {
  createBeaconDetails,
  getBeaconDetails,
  updateBeacon,
  deleteBeacon,
  getBeaconById,
} from '../../../api/beacondetails'

import { CLOSE_DIALOG, confirmDialogSaga } from '../dialog'
import { setLoading, notify } from './admin'

// constants
export const BEACON_LOADED = 'BEACON:LOADED'
export const SAVE_BEACON = 'BEACON:SAVE'
export const BEACON_SAVED = 'BEACON:SAVED'
export const BEACON_SAVE_CONFLICTED = 'BEACON:SAVE_CONFLICTED'
export const BEACON_SAVE_FAILED = 'BEACON:SAVE_FAILED'
export const REFRESH_BEACON = 'BEACON:REFRESH'
export const LOAD_BEACONS = 'BEACON:LOAD_ALL'
export const BEACONS_LOADED = 'BEACON:ALL_LOADED'
export const RELOAD_BEACONS = 'BEACONS:RELOAD_ALL'
export const UPDATE_BEACONS_COUNT_LIMITS = 'BEACONS:UPDATE_COUNT_LIMITS'
const GET_BEACON = 'BEACON:GET'
const DELETE_BEACONS = 'BEACONS:DELETE'
const GET_BEACON_LOADED = 'BEACON:GET_LOADED'
const CLEAR_BEACON = 'BEACON:CLEAR'

export const SaveStatus = {
  Initial: 'initial',
  Saving: 'saving',
  Saved: 'saved',
  Failed: 'failed',
  Conflict: 'conflict',
}

// actions
export const loadBeaconsAction = () => ({ type: LOAD_BEACONS })
export const reloadBeaconsAction = () => ({ type: RELOAD_BEACONS })
export const saveBeaconsAction = form => {
  return { type: SAVE_BEACON, payload: form }
}
export const deleteBeaconsAction = ids => ({
  type: DELETE_BEACONS,
  payload: ids,
})
const beaconSaveFailedAction = error => ({
  type: BEACON_SAVE_FAILED,
  payload: { error },
})
export const loadBeacon = beacon_id => ({
  type: GET_BEACON,
  payload: { beacon_id },
})
export const refreshBeaconAction = () => ({ type: REFRESH_BEACON })
export const clearBeacon = () => ({ type: CLEAR_BEACON })

// initial state
const initialState = {
  status: 'loading',
  data: {},
  saveStatus: SaveStatus.Initial,
  activeBeacon: null,
}

//reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_BEACONS:
      return { ...state, status: 'loading' }
    case BEACON_LOADED:
      return {
        ...state,
        status: 'loaded',
        data: { ...state.data, [action.payload.id]: action.payload },
      }
    case BEACONS_LOADED:
      return {
        ...state,
        status: 'loaded',
        message: action.payload.message,
        data: action.payload.data,
      }
    case SAVE_BEACON:
      return {
        ...state,
        saveStatus: SaveStatus.Saving,
      }
    case BEACON_SAVED: {
      return {
        ...state,
        saveStatus: SaveStatus.Saved,
        data: {
          ...state.data,
          [action.payload.object_id]: {
            ...state.data[action.payload.object_id],
            ...action.payload,
          },
        },
        activeBeacon: {
          ...state.data,
          ...action.payload,
        },
      }
    }
    case GET_BEACON_LOADED:
      return {
        ...state,
        activeBeacon: action.payload.beacon,
      }
    case BEACON_SAVE_FAILED: {
      return {
        ...state,
        saveStatus: SaveStatus.Failed,
      }
    }
    case CLEAR_BEACON:
      return { ...state, activeBeacon: null }
    default:
      return state
  }
}

// sagas
function* loadBeaconsSaga() {
  const beacondetails = yield call(() => getBeaconDetails())
  yield put({ type: BEACONS_LOADED, payload: { ...beacondetails } })
}

function* saveBeaconsSaga({ payload }) {
  const beaconData = {
    beacon_id: payload.id,
    beacon_name: payload.beacon_name,
    beacon_location: payload.beacon_location,
  }
  try {
    const beacon = yield call(() =>
      payload.id
        ? updateBeacon(beaconData)
        : createBeaconDetails({ ...beaconData }),
    )
    yield put({ type: CLOSE_DIALOG })
    yield put({ type: BEACON_SAVED, payload: beacon })
    yield put(
      setLoading(true, payload.id ? `Updating beacon` : `Creating new beacon`),
    )
    yield loadBeaconsSaga()
    yield put(setLoading(false))
    yield put(
      notify(
        payload.id
          ? `Beacon Updated Successfully`
          : `New beacon details Create Successfully`,
      ),
    )
  } catch (err) {
    yield put(beaconSaveFailedAction(err))
  }
}

function* deleteBeaconsSaga({ payload: beacon_id }) {
  if (
    !(yield confirmDialogSaga(
      `Delete beacons details`,
      `Are you sure you want to delete beacon(s)?`,
      `Delete`,
    ))
  ) {
    return
  }

  yield put(setLoading(true, `Deleting ${beacon_id.length} beacon(s)`))

  for (let i = 0; i < beacon_id.length; i++) {
    yield call(() => deleteBeacon(beacon_id[i]))
  }

  yield loadBeaconsSaga()

  yield put(setLoading(false))
  yield put(notify(`${beacon_id.length} beacon(s) have been deleted.`))
}

function* getBeaconSaga({ payload: { beacon_id } }) {
  const beacon = yield call(() => getBeaconById(beacon_id))

  yield put({ type: GET_BEACON_LOADED, payload: { beacon } })
}

function* watch() {
  yield takeEvery(SAVE_BEACON, saveBeaconsSaga)
  yield takeEvery(LOAD_BEACONS, loadBeaconsSaga)
  yield takeEvery(RELOAD_BEACONS, loadBeaconsSaga)
  yield takeEvery(DELETE_BEACONS, deleteBeaconsSaga)
  yield takeEvery(GET_BEACON, getBeaconSaga)
}

export default { reducer, watch }
