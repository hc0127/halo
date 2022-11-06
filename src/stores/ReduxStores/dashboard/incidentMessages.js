// imports
import { call, put, takeLatest, select } from 'redux-saga/effects'
import moment from 'moment'

import utils from '../../../utils/helpers'

// api calls
import {
  // getIncidentMessages,
  getIncidentMessagesForEvent,
} from '../../../api/incidents'

import { getIncidentMessages } from '../../../appsync-service/queries/incident'

// constants
const LOAD_INCIDENT_MESSAGES = 'MESSAGES:LOAD'
const RELOAD_INCIDENT_MESSAGES = 'MESSAGES:RELOAD'
const INCIDENT_MESSAGES_LOADED = 'MESSAGES:LOADED'
const LOAD_ALL_INCIDENT_MESSAGES = 'MESSAGES:LOAD_ALL'
const ALL_INCIDENT_MESSAGES_LOADED = 'MESSAGES:ALL_LOADED'
const NEW_INCIDENT_MESSAGE_ADDED = 'MESSAGE:ADDED'

// actions
export const loadMessages = incidentId => ({
  type: LOAD_INCIDENT_MESSAGES,
  payload: { incidentId },
})

export const addNewIncidentMessage = (message, incidentId) => ({
  type: NEW_INCIDENT_MESSAGE_ADDED,
  payload: { message, incidentId },
})

export const reloadMessages = incidentId => ({
  type: RELOAD_INCIDENT_MESSAGES,
  payload: { incidentId },
})

export const loadAllMessages = () => ({ type: LOAD_ALL_INCIDENT_MESSAGES })

// initial state
const initialState = {
  listByIncidentId: {},
  status: 'loading',
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RELOAD_INCIDENT_MESSAGES:
      return { ...state }
    case LOAD_INCIDENT_MESSAGES:
    case LOAD_ALL_INCIDENT_MESSAGES:
      return { ...state, status: 'loading' }
    case INCIDENT_MESSAGES_LOADED:
      return {
        ...state,
        status: 'loaded',
        listByIncidentId: {
          ...state.listByIncidentId,
          [action.payload.incidentId]: action.payload.messages,
        },
      }
    case NEW_INCIDENT_MESSAGE_ADDED: {
      let incidentId = action.payload.incidentId
      let message = action.payload.message

      if (!state.listByIncidentId[incidentId]) return state

      let incidentMessages = [...state.listByIncidentId[incidentId]]
      incidentMessages.push(message)

      return {
        ...state,
        listByIncidentId: {
          ...state.listByIncidentId,
          [incidentId]: incidentMessages,
        },
      }
    }

    case ALL_INCIDENT_MESSAGES_LOADED:
      return {
        ...state,
        status: 'loaded',
        listByIncidentId: action.payload.allIncidentMessages.reduce(
          (listById, message) => {
            const incidentId = message.incident.object_id
            return {
              ...listById,
              [incidentId]: !listById[incidentId]
                ? [message]
                : [...listById[incidentId], message],
            }
          },
          {},
        ),
      }

    default:
      return state
  }
}

function* loadIncidentMessagesSaga({ payload: { incidentId } }) {
  const messages = yield call(() => getIncidentMessages(incidentId))

  yield put({
    type: INCIDENT_MESSAGES_LOADED,
    payload: { incidentId, messages },
  })
}

function* loadAllIncidentMessagesSaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const allIncidentMessages = yield call(() =>
    getIncidentMessagesForEvent(eventId),
  )
  yield put({
    type: ALL_INCIDENT_MESSAGES_LOADED,
    payload: { allIncidentMessages },
  })
}

// sagas
function* watch() {
  yield takeLatest(LOAD_INCIDENT_MESSAGES, loadIncidentMessagesSaga)
  yield takeLatest(RELOAD_INCIDENT_MESSAGES, loadIncidentMessagesSaga)
  yield takeLatest(LOAD_ALL_INCIDENT_MESSAGES, loadAllIncidentMessagesSaga)
}

// selectors
export const getIncidentMessagesList = (state, incidentId) => {
  if (!incidentId) return {}
  const messages = state.incidentMessages.listByIncidentId[incidentId]
  if (!messages) return {}

  const incidentMessagesMap = {}

  messages.forEach(message => {
    // const day = utils.getFormattedDateOffset(message.createdAt, "Today");
    let day = utils.formatDate(message.created_at, 'dddd Do MMMM YYYY')

    if (moment(message.created_at).isSame(moment(), 'day')) {
      day = 'Today'
    }

    if (incidentMessagesMap[day]) {
      incidentMessagesMap[day].push(message)
    } else {
      incidentMessagesMap[day] = [message]
    }
  })

  return incidentMessagesMap
}

export const getAllIncidentMessages = state => {
  const { listByIncidentId } = state.incidentMessages

  const incidentIds = Object.keys(state.incidents.data).concat(
    state.incidents.closedIncidentList.map(({ id }) => id),
  )

  incidentIds.forEach(incidentId => {
    if (!listByIncidentId[incidentId]) {
      listByIncidentId[incidentId] = []
    }
  })

  return listByIncidentId
}

export const getLoading = state => state.incidentMessages.status === 'loading'

// exports
export default { reducer, watch }
