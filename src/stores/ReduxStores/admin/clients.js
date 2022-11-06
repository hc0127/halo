// imports
import { call, put, takeEvery, take } from 'redux-saga/effects'
import _ from 'lodash'

import {
  SAVE_CUSTOM_INCIDENT_TYPES,
  CUSTOM_INCIDENT_TYPES_SAVED,
  LOAD_CUSTOM_INCIDENT_TYPES,
  CUSTOM_INCIDENT_TYPES_LOADED,
} from './customIncidentTypes'
import { confirmDialogSaga } from '../dialog'
import { loadEventsSaga } from './events'
import { loadUsersSaga } from './users'
import { loadGroupsSaga } from './groups'
import { setLoading, notify } from './admin'

// api calls
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  suspendClients,
  getUsedIncidentTypes,
  getEventAndStaffCounts,
} from '../../../api/clients'

// constants
export const CLIENT_LOADED = 'CLIENT:LOADED'
export const SAVE_CLIENT = 'CLIENT:SAVE'
export const CLIENT_SAVED = 'CLIENT:SAVED'
export const CLIENT_SAVE_CONFLICTED = 'CLIENT:SAVE_CONFLICTED'
export const CLIENT_SAVE_FAILED = 'CLIENT:SAVE_FAILED'
export const REFRESH_CLIENT = 'CLIENT:REFRESH'
export const LOAD_CLIENTS = 'CLIENTS:LOAD_ALL'
export const CLIENTS_LOADED = 'CLIENT:ALL_LOADED'
export const RELOAD_CLIENTS = 'CLIENTS:RELOAD_ALL'
const DELETE_CLIENTS = 'CLIENTS:DELETE'
const SUSPEND_CLIENTS = 'CLIENTS:SUSPEND'
const CLIENTS_LIMITS_LOADED = 'CLIENTS:LIMITS_LOADED'
export const UPDATE_CLIENTS_COUNT_LIMITS = 'CLIENTS:UPDATE_COUNT_LIMITS'

const CLIENT_USED_INCIDENT_TYPES_LOADED = 'CLIENT:USED_INCIDENT_TYPES_LOADED'

export const SaveStatus = {
  Initial: 'initial',
  Saving: 'saving',
  Saved: 'saved',
  Failed: 'failed',
  Conflict: 'conflict',
}

// actions
export const loadClientsAction = () => ({ type: LOAD_CLIENTS })
export const reloadClientsAction = () => ({ type: RELOAD_CLIENTS })
export const saveClientsAction = form => ({ type: SAVE_CLIENT, payload: form })
export const deleteClientsAction = ids => ({
  type: DELETE_CLIENTS,
  payload: ids,
})
export const suspendClientsAction = ids => ({
  type: SUSPEND_CLIENTS,
  payload: ids,
})
export const refreshClientsAction = () => ({ type: REFRESH_CLIENT })
const clientSaveConflictedAction = () => ({ type: CLIENT_SAVE_CONFLICTED }) //eslint-disable-line
const clientSaveFailedAction = error => ({
  type: CLIENT_SAVE_FAILED,
  payload: { error },
})

// initial state
const initialState = {
  status: 'loading',
  data: {},
  // extra is current to old the client data regarding existing incidents
  extraData: { eventCounts: {}, staffCounts: {} },
  saveStatus: SaveStatus.Initial,
}

// reducer
const reducer = (state = initialState, action) => {
  let usedIncidentTypes
  switch (action.type) {
    case RELOAD_CLIENTS:
      return { ...state, status: 'loading', saveStatus: SaveStatus.Initial }
    case REFRESH_CLIENT:
      return { ...state, status: 'loaded', saveStatus: SaveStatus.Initial }
    case CLIENT_LOADED:
      return {
        ...state,
        status: 'loaded',
        data: { ...state.data, [action.payload.id]: action.payload },
      }
    case CLIENTS_LOADED:
      return {
        ...state,
        status: 'loaded',
        data: action.payload.reduce((map, client) => {
          // eslint-disable-next-line no-param-reassign
          map[client.object_id] = client
          return map
        }, {}),
      }
    case SAVE_CLIENT:
      return {
        ...state,
        saveStatus: SaveStatus.Saving,
      }
    case CLIENT_SAVED:
      return {
        ...state,
        saveStatus: SaveStatus.Saved,
        data: { ...state.data, [action.payload.object_id]: action.payload },
      }
    case CLIENT_SAVE_CONFLICTED:
      return { ...state, saveStatus: SaveStatus.Conflict }
    case CLIENT_SAVE_FAILED:
      return { ...state, saveStatus: SaveStatus.Failed }
    case CLIENTS_LIMITS_LOADED:
      return { ...state, extraData: { ...state.extraData, ...action.payload } }
    case UPDATE_CLIENTS_COUNT_LIMITS:
      return {
        ...state,
        extraData: {
          ...state.extraData,
          [action.payload.type]: {
            ...state.extraData[action.payload.type],
            [action.payload.clientId]:
              state.extraData[action.payload.type][action.payload.clientId] +
              action.payload.value,
          },
        },
      }
    case CLIENT_USED_INCIDENT_TYPES_LOADED:
      ;({ usedIncidentTypes } = action.payload)

      return {
        ...state,
        extraData: _.merge(
          state.extraData,
          Object.keys(usedIncidentTypes).reduce(
            (map, clientId) => ({
              ...map,
              [clientId]: { usedIncidentTypes: usedIncidentTypes[clientId] },
            }),
            {},
          ),
        ),
      }
    default:
      return state
  }
}

// sagas
function* loadUsedIncidentTypesSaga() {
  const { usedIncidentTypes } = yield call(() => getUsedIncidentTypes())

  yield put({
    type: CLIENT_USED_INCIDENT_TYPES_LOADED,
    payload: { usedIncidentTypes },
  })
}

function* loadClientsSaga() {
  // loads event and staff counts
  const { staffCounts, eventCounts } = yield call(() =>
    getEventAndStaffCounts(),
  )

  yield put({
    type: CLIENTS_LIMITS_LOADED,
    payload: { eventCounts, staffCounts },
  })

  const { results: clients } = yield call(() => getClients())

  yield loadUsedIncidentTypesSaga()

  yield put({ type: LOAD_CUSTOM_INCIDENT_TYPES, payload: { clients } })
  yield take(CUSTOM_INCIDENT_TYPES_LOADED)

  yield put({ type: CLIENTS_LOADED, payload: clients })
}

function* saveClientSaga({ payload }) {
  const isUpdatingClient = payload.id !== undefined
  const clientData = {
    clientId: payload.id || undefined,
    name: payload.name,
    contact_name: payload.contactName,
    contact_email: payload.contactEmail,
    contact_phone: payload.contactPhone,
    address: payload.address,
    enabled_incident_types: payload.enabledIncidentTypes,
    enabled_features: payload.enabledFeatures,
    licence_expiry: payload.licenceExpiry,
    suspended: payload.suspended,
    event_limit: payload.eventLimit || null,
    staff_limit: payload.staffLimit || null,
  }
  try {
    const client = yield call(() =>
      isUpdatingClient ? updateClient(clientData) : createClient(clientData),
    )
    yield put({
      type: SAVE_CUSTOM_INCIDENT_TYPES,
      payload: {
        client,
        initialIncidents: payload.initialIncidents,
        mutatedIncidents: payload.mutatedIncidents,
      },
    })
    yield take(CUSTOM_INCIDENT_TYPES_SAVED)
    yield put({ type: CLIENT_SAVED, payload: client })
  } catch (err) {
    yield put(clientSaveFailedAction(err))
  }
}

function* deleteClientsSaga({ payload: clientIds }) {
  if (
    !(yield confirmDialogSaga(
      `Delete clients`,
      `Are you sure you want to delete client(s)?`,
      `Delete`,
    ))
  ) {
    return
  }

  yield put(setLoading(true, `Deleting ${clientIds.length} client(s)`))

  for (let i = 0; i < clientIds.length; i++) {
    yield call(() => deleteClient(clientIds[i]))
  }

  yield loadGroupsSaga()
  yield loadUsersSaga()
  yield loadEventsSaga()
  yield loadClientsSaga()

  yield put(setLoading(false))
  yield put(notify(`${clientIds.length} client(s) have been deleted.`))
}

function* suspendClientsSaga({ payload: clientIds }) {
  if (
    !(yield confirmDialogSaga(
      `Suspend clients`,
      `Are you sure you want to suspend client(s)?`,
      `Suspend`,
    ))
  ) {
    return
  }

  yield put(setLoading(true, `Suspending ${clientIds.length} client(s)`))

  yield call(() => suspendClients(clientIds))
  yield loadClientsSaga()

  yield put(setLoading(false))
  yield put(notify(`${clientIds.length} client(s) have been suspended.`))
}

function* watch() {
  yield takeEvery(SAVE_CLIENT, saveClientSaga)
  yield takeEvery(LOAD_CLIENTS, loadClientsSaga)
  yield takeEvery(RELOAD_CLIENTS, loadClientsSaga)
  yield takeEvery(SUSPEND_CLIENTS, suspendClientsSaga)
  yield takeEvery(DELETE_CLIENTS, deleteClientsSaga)
}

// exports
export default { reducer, watch }
