// imports
import { call, put, takeEvery, take } from 'redux-saga/effects'

// api calls
import {
  getCustomIncidents,
  updateCustomIncident,
  createCustomIncident,
  deleteCustomIncident,
} from '../../../api/custom-incidents'

// constants
export const LOAD_CUSTOM_INCIDENT_TYPES = 'CUSTOM_INCIDENT_TYPES:LOAD'
export const CUSTOM_INCIDENT_TYPES_LOADED = 'CUSTOM_INCIDENT_TYPES:LOADED'
export const SAVE_CUSTOM_INCIDENT_TYPES = 'CUSTOM_INCIDENT_TYPES:SAVE'
export const CUSTOM_INCIDENT_TYPES_SAVED = 'CUSTOM_INCIDENT_TYPES:SAVED'

// initial state
const initialState = {
  status: 'loading',
  list: [],
}

// reducer
const reducer = (state = initialState, action) => {
  let customIncidentTypes
  let loadingType
  let customIncidentTypeIds

  switch (action.type) {
    case LOAD_CUSTOM_INCIDENT_TYPES:
      return { ...state, status: 'loading' }
    case CUSTOM_INCIDENT_TYPES_LOADED:
      ;({ customIncidentTypes, loadingType } = action.payload)

      customIncidentTypeIds = customIncidentTypes.map(type => type.id)

      if (loadingType === 'partial') {
        customIncidentTypes = [
          ...state.list.filter(
            type => !customIncidentTypeIds.includes(type.id),
          ),
          ...customIncidentTypes,
        ]
      }

      return {
        ...state,
        status: 'loaded',
        list: customIncidentTypes,
      }
    case CUSTOM_INCIDENT_TYPES_SAVED:
      return { ...state, status: 'saved' }
    case SAVE_CUSTOM_INCIDENT_TYPES:
      return { ...state, status: 'saving' }
    default:
      return state
  }
}

// sagas
function* loadCustomIncidentTypesSaga({ payload: { client } }) {
  const { results: customIncidentTypes } = yield call(() =>
    getCustomIncidents(),
  )

  yield put({
    type: CUSTOM_INCIDENT_TYPES_LOADED,
    payload: { customIncidentTypes, loadingType: client ? 'partial' : 'full' },
  })
}

function* saveCustomIncidentTypesSaga({ payload }) {
  const addedIncidents = payload.mutatedIncidents.filter(
    incident => !incident.id,
  )
  const deletedIncidents = payload.initialIncidents.filter(
    ({ object_id }) =>
      !payload.mutatedIncidents.some(({ id }) => id === object_id),
  )
  // updating incidents
  for (let idx in payload.initialIncidents) {
    const initialIncident = payload.initialIncidents[idx]
    const mutatedIncident = payload.mutatedIncidents[idx]
    if (mutatedIncident?.id && initialIncident.name !== mutatedIncident.name) {
      yield call(() =>
        updateCustomIncident({
          incidentTypeId: mutatedIncident.id,
          incidentTypeName: mutatedIncident.name,
        }),
      )
    }
  }
  // creating incidents
  if (addedIncidents.length) {
    for (let idx in addedIncidents) {
      const addedIncident = {
        client: payload.client.object_id,
        name: addedIncidents[idx].name,
      }
      yield call(() => createCustomIncident(addedIncident))
    }
  }
  // deleting incidents
  if (deletedIncidents.length) {
    for (let idx in deletedIncidents) {
      yield call(() => deleteCustomIncident(deletedIncidents[idx].object_id))
    }
  }
  yield put({
    type: LOAD_CUSTOM_INCIDENT_TYPES,
    payload: { client: payload.client },
  })
  yield take(CUSTOM_INCIDENT_TYPES_LOADED)
  yield put({ type: CUSTOM_INCIDENT_TYPES_SAVED })
}

function* watch() {
  yield takeEvery(LOAD_CUSTOM_INCIDENT_TYPES, loadCustomIncidentTypesSaga)
  yield takeEvery(SAVE_CUSTOM_INCIDENT_TYPES, saveCustomIncidentTypesSaga)
}

// exports
export default { reducer, watch }
