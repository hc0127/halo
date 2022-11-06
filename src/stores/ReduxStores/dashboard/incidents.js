// imports
import { call, put, takeEvery, select, takeLatest } from 'redux-saga/effects'

import { RESET_EVENT } from './currentEvent'
import { closeDialog, closeSlidingView } from './dashboard'
import utils from '../../../utils/helpers'

// api calls
import {
  // getEventIncidents,
  // createIncident,
  // createIncidentMessage,
  // resolveIncident,
  // unresolveIncident,
  // closeIncident,
  // getClosedIncidents,
  // markIncidentAsRead,
  shareIncident,
  updateIncidentTags,
  updateIncident,
  // markIncidentMessagesAsRead,
  getClosedIncidentsCount,
  // reopenIncident,
} from '../../../api/incidents'

import {
  getEventIncidents,
  getClosedIncidents,
} from '../../../appsync-service/queries/incident'
import {
  createIncident as createIncidentGQL,
  resolveIncident,
  unresolveIncident,
  closeIncident,
  createIncidentMessage,
  updateIncident as updateIncidentGQL,
  markIncidentAsRead,
  markIncidentMessagesAsRead,
  reopenIncident,
} from '../../../appsync-service/mutations/incident'

// constants
export const LOAD_INCIDENTS = 'INCIDENTS:LOAD'
export const LOAD_CLOSED_INCIDENTS = 'INCIDENTS:LOAD_CLOSED'
const INCIDENTS_LOADED = 'INCIDENTS:LOADED'
const CLOSED_INCIDENTS_LOADED = 'INCIDENTS:CLOSED_LOADED'
const SAVE_INCIDENT = 'INCIDENT:SAVE'
const INCIDENT_SAVED = 'INCIDENT:SAVED'
const ADD_MESSAGE_INCIDENT = 'INCIDENT:ADD_MESSAGE'
const RESOLVE_INCIDENT = 'INCIDENT:RESOLVE'
const UNRESOLVE_INCIDENT = 'INCIDENT:UNRESOLVE'
const REOPEN_INCIDENT = 'INCIDENT:REOPEN'
const UPDATE_CLOSED_INCIDENTS_WITH_COUNT = 'UPDATE_CLOSED_INCIDENTS_WITH_COUNT'
const ARCHIVE_INCIDENT = 'INCIDENT:ARCHIVE'
const MARK_INCIDENT_AS_READ = 'INCIDENT:MARK_AS_READ'
const MARK_INCIDENT_MESSAGES_AS_READ = 'INCIDENT:MARK_MESSAGES_AS_READ'
const NEW_INCIDENT_ADDED = 'INCIDENT:ADDED'
const INCIDENT_UPDATED = 'INCIDENT:UPDATED'
const INCIDENT_REMOVED = 'INCIDENT:REMOVED'
const SHARE_INCIDENT = 'INCIDENT:SHARE'
const UPDATE_INCIDENT_TAGS = 'INCIDENT:UPDATE_TAGS'
const UPDATE_INCIDENT_TAGS_DONE = 'INCIDENT:UPDATE_TAGS:DONE'
const UPDATE_CLOSE_INCIDENT_COUNT = 'INCIDENT:UPDATE_CLOSED_COUNT'
const SET_INCIDENTS_FOR_TABLE = 'INCIDENT:INCIDENTS_FOR_TABLE'
const SET_SELECTED_INCIDENT_TABLE = 'INCIDENT:SELECTED_INCIDENT_TABLE'
const UPDATE_INCIDENT_ROW_TABLE = 'INCIDENT:INCIDENT_ROW_TABLE:UPDATE'
const UPDATE_INCIDENT = 'INCIDENT:UPDATE'
const UPDATE_BAN_INCIDENT = 'BANINCIDENT:UPDATE'
const SET_LIVE_INCIDENTS = 'LIVE_INCIDENTS:ADDED'
const SET_LIVE_INCIDENTS_TYPES = 'LIVE_INCIDENTS_TYPES:ADDED'

// actions
export const setLiveIncidents = liveIncidents => ({
  type: SET_LIVE_INCIDENTS,
  payload: { liveIncidents },
})
export const setLiveIncidentTypes = types => ({
  type: SET_LIVE_INCIDENTS_TYPES,
  payload: { types },
})
export const loadIncidents = () => ({ type: LOAD_INCIDENTS })
export const addNewIncident = incident => ({
  type: NEW_INCIDENT_ADDED,
  payload: { incident },
})
export const setUpdatedIncident = incident => ({
  type: INCIDENT_UPDATED,
  payload: { incident },
})
export const removeIncident = incident => ({
  type: INCIDENT_REMOVED,
  payload: { incident },
})
export const setIncidentsForTable = incidents => ({
  type: SET_INCIDENTS_FOR_TABLE,
  payload: { incidents },
})
export const setSelectedIncidentTable = incident => ({
  type: SET_SELECTED_INCIDENT_TABLE,
  payload: { incident },
})
export const updateIncidentTable = ({ id, updatedFields }) => ({
  type: UPDATE_INCIDENT_ROW_TABLE,
  payload: { id, updatedFields },
})

export const loadClosedIncidents = () => ({ type: LOAD_CLOSED_INCIDENTS })
export const saveIncident = (type, form, file, user) => ({
  type: SAVE_INCIDENT,
  payload: { type, form, file, user },
})
export const updateIncidentDetails = (id, type, form, file, user) => ({
  type: UPDATE_INCIDENT,
  payload: { id, type, form, file, user },
})
export const updateBanIncidentDetails = (id, type, form, user) => ({
  type: UPDATE_BAN_INCIDENT,
  payload: { id, type, form, user },
})
export const addMessageToIncident = (incident, message, image, callback) => ({
  type: ADD_MESSAGE_INCIDENT,
  payload: { incident, message, image, callback },
})
export const resolveIncidentAction = (incident, message) => ({
  type: RESOLVE_INCIDENT,
  payload: { incident, message },
})
export const unresolveIncidentAction = incident => ({
  type: UNRESOLVE_INCIDENT,
  payload: { incident },
})
export const reopenIncidentAction = incident => ({
  type: REOPEN_INCIDENT,
  payload: { incident },
})
export const archiveIncident = (
  incident,
  message,
  debrief,
  isAnalyticsPage,
) => ({
  type: ARCHIVE_INCIDENT,
  payload: { incident, message, debrief, isAnalyticsPage },
})
export const markIncidentAsReadAction = (incident, user) => ({
  type: MARK_INCIDENT_AS_READ,
  payload: { user, incident },
})
export const markIncidentMessageAsRead = (incident, user) => ({
  type: MARK_INCIDENT_MESSAGES_AS_READ,
  payload: { incident, user },
})
export const shareIncidentAction = (incident, users, tags) => ({
  type: SHARE_INCIDENT,
  payload: { incident, users, tags },
})

export const updateIncidentTagsAction = (
  incident,
  tags,
  onIncidentTagsUpdated,
) => ({
  type: UPDATE_INCIDENT_TAGS,
  payload: { incident, tags, onIncidentTagsUpdated },
})

// initial state
const initialState = {
  status: 'loading',
  data: {},
  closedIncidentCount: 0,
  closedIncidentList: [],
  liveIncidents: [],
  liveIncidentTypes: [],
  tableData: [],
  selectedTableIncident: null,
}

const reducer = (state = initialState, action) => {
  let newData
  switch (action.type) {
    case RESET_EVENT:
      return { ...initialState }
    case INCIDENT_UPDATED: {
      let incident = action.payload.incident
      return {
        ...state,
        data: { ...state.data, [incident.id]: incident },
      }
    }
    case SET_LIVE_INCIDENTS:
      return {
        ...state,
        liveIncidents: action.payload.liveIncidents,
      }
    case SET_LIVE_INCIDENTS_TYPES:
      return {
        ...state,
        liveIncidentTypes: action.payload.types,
      }
    case SET_INCIDENTS_FOR_TABLE:
      return {
        ...state,
        tableData: action.payload.incidents,
      }
    case SET_SELECTED_INCIDENT_TABLE:
      return {
        ...state,
        selectedTableIncident: action.payload.incident,
      }
    case INCIDENT_REMOVED:
      newData = { ...state.data }
      let incident = action.payload?.incident
      delete newData[incident?.object_id]

      return {
        ...state,
        data: { ...newData },
        closedIncidentCount: state.closedIncidentCount + 1,
        closedIncidentList: [...state.closedIncidentList, incident],
      }
    case UPDATE_CLOSE_INCIDENT_COUNT:
      return { ...state, closedIncidentCount: action.payload }
    case UPDATE_CLOSED_INCIDENTS_WITH_COUNT:
      return {
        ...state,
        closedIncidentCount: action.payload.closedIncidentCount,
        closedIncidentList: action.payload.closedIncidentList,
      }
    case INCIDENTS_LOADED:
      return {
        ...state,
        status: 'loaded',
        data: action.payload.reduce((map, client) => {
          // eslint-disable-next-line no-param-reassign
          map[client.id] = client
          return map
        }, {}),
      }
    case NEW_INCIDENT_ADDED: {
      let incident = action.payload.incident
      return {
        ...state,
        data: { ...state.data, [incident.id]: incident },
      }
    }
    case CLOSED_INCIDENTS_LOADED:
      return { ...state, closedIncidentList: action.payload.closedIncidents }
    case SAVE_INCIDENT:
      return { ...state, status: 'saving' }
    case INCIDENT_SAVED:
      return { ...state, status: 'saved' }
    case UPDATE_INCIDENT:
      return { ...state, status: 'updating' }
    case UPDATE_BAN_INCIDENT:
      return { ...state, status: 'updating' }
    case UPDATE_INCIDENT_TAGS:
      return { ...state }
    case UPDATE_INCIDENT_TAGS_DONE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.incidentId]: {
            ...state.data[action.payload.incidentId],
            tags: action.payload.tags,
          },
        },
      }
    default:
      return state
  }
}

function* getClosedIncidentCountSaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const { count: closedIncidentCount } = yield call(() =>
    getClosedIncidentsCount(eventId),
  )
  yield put({
    type: UPDATE_CLOSE_INCIDENT_COUNT,
    payload: closedIncidentCount,
  })
}

const formatIncidentGeoPoints = incident =>
  incident.capture_data.location
    ? {
        latitude: incident.capture_data.location.coordinates[0],
        longitude: incident.capture_data.location.coordinates[1],
      }
    : null

export const formatIncident = incident => ({
  ...incident,
  id: incident.object_id,
  capture_data: {
    ...JSON.parse(incident.capture_data),
    location: formatIncidentGeoPoints({
      ...incident,
      capture_data: JSON.parse(incident.capture_data),
    }),
  },
})

function* loadIncidentsSaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const incidents = yield call(() => getEventIncidents(eventId))

  const formattedIncidents = incidents.items.map(incident => ({
    ...incident,
    id: incident.object_id,
    capture_data: {
      ...JSON.parse(incident.capture_data),
      location: formatIncidentGeoPoints({
        ...incident,
        capture_data: JSON.parse(incident.capture_data),
      }),
    },
  }))

  yield put({ type: INCIDENTS_LOADED, payload: formattedIncidents })
}

function* loadClosedIncidentsSaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const closedIncidents = yield call(() => getClosedIncidents(eventId))
  const formattedClosedIncidents = closedIncidents.items.map(incident => ({
    ...incident,
    id: incident.object_id,
    capture_data: {
      ...JSON.parse(incident.capture_data),
      location: formatIncidentGeoPoints({
        ...incident,
        capture_data: JSON.parse(incident.capture_data),
      }),
    },
  }))

  yield put({
    type: CLOSED_INCIDENTS_LOADED,
    payload: { closedIncidents: formattedClosedIncidents },
  })
}

function* addMessageSaga({ payload: { incident, message, image, callback } }) {
  let attachment
  if (image) attachment = yield call(() => utils.base64EncodeFile(image))

  yield call(() =>
    createIncidentMessage(incident.object_id, { message, attachment }),
  )

  callback()
}

function* resolveIncidentSaga({ payload: { incident, message } }) {
  yield call(() =>
    resolveIncident(incident.object_id, { resolved_text: message }),
  )
  // yield loadIncidentsSaga()

  yield put(closeDialog())
}

function* unresolveIncidentSaga({ payload: { incident } }) {
  yield call(() => unresolveIncident(incident.object_id))
  yield loadIncidentsSaga()
}

function* reopenIncidentSaga({ payload: { incident } }) {
  yield call(() => reopenIncident(incident.object_id))

  yield loadIncidentsSaga()
  yield put(loadClosedIncidents())

  yield put(closeSlidingView())
}

function* archiveIncidentSaga({
  payload: { incident, message, debrief, isAnalyticsPage },
}) {
  yield call(() =>
    closeIncident(incident.object_id, { archived_text: message, debrief }),
  )

  yield put(closeDialog())

  yield put(closeSlidingView())
}

function* markIncidentAsReadSaga({ payload: { user, incident } }) {
  const isIncidentRead = utils.isIncidentReadByUser(incident, user)

  if (!isIncidentRead) {
    yield call(() => markIncidentAsRead(incident.object_id))
    // yield loadIncidentsSaga()
  }
}

function* markIncidentMessagesAsReadSaga({ payload: { user, incident } }) {
  if (
    !incident?.message_read_list.includes(user.object_id) &&
    incident.incident_messages.length
  ) {
    yield call(() => markIncidentMessagesAsRead(incident.object_id))
    // yield loadIncidentsSaga()
  }
}

function* saveIncidentSaga({ payload: { type, form, file, user } }) {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const encodedImg = yield call(() => utils.base64EncodeFile(file))
  let locationPoint = {}

  if (form.location) {
    locationPoint = {
      type: 'Point',
      coordinates: [form.location.latitude, form.location.longitude],
    }
    //  for default coordinates
  } else {
    locationPoint = {
      type: 'Point',
      coordinates: [0, 0],
    }
  }

  let incidentDetails = {
    type_value: type,
    capture_data: { ...form, location: locationPoint },
  }

  if (encodedImg) {
    incidentDetails = {
      ...incidentDetails,
      capture_data: {
        ...incidentDetails.capture_data,
        photo: encodedImg,
      },
    }
  }

  yield call(() => createIncidentGQL(eventId, incidentDetails))

  // yield markIncidentAsReadSaga({ payload: { incident, user } })

  yield put(closeSlidingView())
}

function* updateIncidentSaga({ payload: { id, type, form, file, user } }) {
  const encodedImg = yield call(() => utils.base64EncodeFile(file))
  let locationPoint = {}
  
  if (form.location) {
    locationPoint = {
      type: 'Point',
      coordinates: [form.location.latitude, form.location.longitude],
    }
    //  for default coordinates
  } else {
    locationPoint = {
      type: 'Point',
      coordinates: [0, 0],
    }
  }

  let incidentDetails = {
    type_value: type,
    capture_data: { ...form, location: locationPoint },
  }

  if (encodedImg) {
    incidentDetails = {
      ...incidentDetails,
      capture_data: {
        ...incidentDetails.capture_data,
        photo: encodedImg,
      },
    }
  }

  let incident = yield call(() => updateIncidentGQL(id, incidentDetails))

  yield markIncidentAsReadSaga({ payload: { incident, user } })

  yield put(closeSlidingView())
}

function* updateBanIncidentSaga({ payload: { id, type, form, user } }) {

  let locationPoint = {
    type: 'Point',
    coordinates: [0, 0],
  }

  let incidentDetails = {
    type_value: type,
    capture_data: { ...form, location: locationPoint },
  }
  
  let incident = yield call(() => updateIncidentGQL(id, incidentDetails))

  yield markIncidentAsReadSaga({ payload: { incident, user } })

  yield loadIncidentsSaga()

  yield put(closeSlidingView())
}

function* shareIncidentSaga({ payload: { incident, users, tags } }) {
  yield call(() => shareIncident(incident.object_id, { userIds: users, tags }))
  yield loadIncidentsSaga()

  yield put(closeDialog())

  yield put(closeSlidingView())
}

function* updateIncidentTagsSaga({
  payload: { incident, tags, onIncidentTagsUpdated },
}) {
  const { tags: newTags } = yield call(() =>
    updateIncidentTags(incident.object_id, { tags }),
  )
  yield put({
    type: UPDATE_INCIDENT_TAGS_DONE,
    payload: { tags: newTags, incidentId: incident.id },
  })
  onIncidentTagsUpdated()
}

function* updateTableIncidentSaga({ payload: { id, updatedFields } }) {
  let tableIncidents = yield select(state => state.incidents.tableData)

  let index = tableIncidents.findIndex(incident => incident.id === id)

  if (index !== -1) {
    let incident = tableIncidents[index]
    incident = {
      ...incident,
      ...updatedFields,
    }
    tableIncidents[index] = incident

    yield setIncidentsForTable(tableIncidents)
  }
}

// sagas
function* watch() {
  yield takeEvery(LOAD_INCIDENTS, loadIncidentsSaga)
  yield takeLatest(LOAD_CLOSED_INCIDENTS, loadClosedIncidentsSaga)
  yield takeEvery(UPDATE_INCIDENT_TAGS, updateIncidentTagsSaga)
  yield takeEvery(SAVE_INCIDENT, saveIncidentSaga)
  yield takeEvery(UPDATE_INCIDENT, updateIncidentSaga)
  yield takeEvery(UPDATE_BAN_INCIDENT, updateBanIncidentSaga)
  yield takeEvery(ADD_MESSAGE_INCIDENT, addMessageSaga)
  yield takeEvery(RESOLVE_INCIDENT, resolveIncidentSaga)
  yield takeEvery(UNRESOLVE_INCIDENT, unresolveIncidentSaga)
  yield takeEvery(REOPEN_INCIDENT, reopenIncidentSaga)
  yield takeEvery(ARCHIVE_INCIDENT, archiveIncidentSaga)
  yield takeEvery(MARK_INCIDENT_AS_READ, markIncidentAsReadSaga)
  yield takeEvery(
    MARK_INCIDENT_MESSAGES_AS_READ,
    markIncidentMessagesAsReadSaga,
  )
  yield takeEvery(SHARE_INCIDENT, shareIncidentSaga)

  // yield takeEvery(INCIDENT_REMOVED, getClosedIncidentCountSaga)
  yield takeEvery(INCIDENTS_LOADED, getClosedIncidentCountSaga)
  yield takeEvery(UPDATE_INCIDENT_ROW_TABLE, updateTableIncidentSaga)
}

// exports
export default { reducer, watch }
