// imports
import { call, put, takeEvery, select } from 'redux-saga/effects'
import { PREP_EVENT_SAVE } from './activeEvent'
import { USER_PERMISSIONS, CHECK_DATE_FORMAT } from '../../../utils/constants'
import { confirmDialogSaga } from '../dialog'
import { setLoading, notify } from './admin'

import { loadTicketScanningSettings } from '../admin/ticketScanning'

import utils from '../../../utils/helpers'

// api calls
import {
  // getEvents,
  // deleteEvents,
  // closeEvent,
  duplicateEvent,
} from '../../../api/events'
import { getEvents } from '../../../appsync-service/queries/event'
import {
  closeEvent,
  deleteEvents,
} from '../../../appsync-service/mutations/event'

import moment from 'moment'

// constants
const LOAD_EVENTS = 'EVENTS:LOAD'
const EVENTS_FILTERED = 'EVENTS:FILTERED'
const EVENTS_LOADED = 'EVENTS:LOADED'
const DELETE_EVENTS = 'EVENTS:DELETE'
export const SAVE_EVENTS = 'EVENTS:SAVE'
export const EVENTS_SAVED = 'EVENTS:SAVED'
const REFRESH_EVENT = 'EVENT:REFRESH'
const CLOSE_EVENT = 'EVENT:CLOSE'
const DUPLICATE_EVENT = 'EVENT:DUPLICATE'

// actions
export const loadEventsAction = () => ({ type: LOAD_EVENTS })
export const deleteEventsAction = ids => ({ type: DELETE_EVENTS, payload: ids })
export const saveEvent = (form, afterEventSave) => ({
  type: SAVE_EVENTS,
  payload: { form, afterEventSave },
})
export const refreshEvent = () => ({ type: REFRESH_EVENT })
export const closeEventAction = (id, onEventClosed) => ({
  type: CLOSE_EVENT,
  payload: { id, onEventClosed },
})
export const duplicateEventAction = (id, events) => ({
  type: DUPLICATE_EVENT,
  payload: { id, events },
})

// initial state
const initialState = {
  status: 'loading',
  data: {},
}

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case REFRESH_EVENT:
      return { ...state, status: 'loaded' }
    case CLOSE_EVENT:
      return { ...state, status: 'closed' }
    case EVENTS_LOADED:
      return {
        ...state,
        status: 'loaded',
        count: action.payload.count,
        nextOffset: action.payload.nextOffset,
        data: action.payload.items.reduce((map, event) => {
          // eslint-disable-next-line no-param-reassign
          map[event.object_id] = event
          return map
        }, {}),
      }
    case EVENTS_FILTERED:
      return {
        ...state,
        data: action.payload,
      }
    case SAVE_EVENTS:
      return { ...state, status: 'saving' }
    case EVENTS_SAVED:
      return {
        ...state,
        status: 'saved',
        data: { ...state.data, [action.payload.object_id]: action.payload },
      }
    default:
      return state
  }
}

// sagas
export function* loadEventsSaga() {
  const user = yield select(state => state.auth.currentUser)
  const clientId = user.client ? user.client.object_id : user.object_id

  if (user.permission_role === USER_PERMISSIONS.ClientManager) {
    yield put(loadTicketScanningSettings(clientId))
  } else {
    yield put(loadTicketScanningSettings())
  }

  const events = yield call(() => getEvents())

  yield put({ type: EVENTS_LOADED, payload: events })
}

function* prepEventSaga({ payload }) {
  const { form, afterEventSave } = payload
  const {
    initialAdminChecks,
    mutatedAdminChecks,
    initialGeoFences,
    mutatedGeoFences,
    duplicatedChecks,
  } = form

  let eventDetails = {
    zones: form.zones,
    client: form.clientId,
    client_id: form.clientId,
    capacity_total: form.capacityTotal,
    end_date: form.endDate,
    event_code: form.eventCode,
    event_pin: form.eventPin,
    import_performance_id: form.importPerformanceId,
    overview: form.overview,
    start_date: form.startDate,
    title: form.title,
    users: form.eventUserIds,
    venue_address: form.address,
    public_report: form.isPublicReportingEnabled,
    staff: form?.event?.staff,
  }

  if (form.customLogo) {
    if (!form.customLogo.url) {
      eventDetails = {
        ...eventDetails,
        custom_logo_file: yield call(() =>
          utils.base64EncodeFile(form.customLogo),
        ),
      }
    }
  } else {
    eventDetails = { ...eventDetails, custom_logo_file: null }
  }

  if (form.brief) {
    if (!form.brief.url) {
      eventDetails = {
        ...eventDetails,
        brief_file: yield call(() => utils.base64EncodeFile(form.brief)),
      }
    }
  } else {
    eventDetails = { ...eventDetails, brief_file: null }
  }

  if (form.shiftManagerId) {
    eventDetails = { ...eventDetails, controlled_by: form.shiftManagerId }
  }

  yield put(setLoading(true, `Saving event`))
  yield put({
    type: PREP_EVENT_SAVE,
    payload: {
      eventId: form.id,
      eventDetails,
      haloChecks: mutatedAdminChecks.map(check => ({
        event: form.id,
        ...check,
      })),
      duplicatedChecks,
      geofenceData: { initialGeoFences, mutatedGeoFences },
      deletedHaloChecks:
        initialAdminChecks.filter(
          initialCheck =>
            !mutatedAdminChecks.some(
              mutatedCheck => mutatedCheck.object_id === initialCheck.object_id,
            ),
        ) || [],
      afterEventSave,
    },
  })

  // yield put({
  //   type: UPDATE_CLIENTS_COUNT_LIMITS,
  //   payload: {
  //     type: 'eventCounts',
  //     value: 1,
  //     clientId: form.id,
  //   },
  // })
}

function* deleteEventsSaga({ payload: eventIds }) {
  if (
    !(yield confirmDialogSaga(
      `Delete events`,
      `Warning! Do you want to permanently delete the event(s)?`,
      `Delete`,
    ))
  ) {
    return
  }

  yield put(setLoading(true, `Deleting ${eventIds.length} event(s)`))

  yield call(() => deleteEvents(eventIds))

  yield filterEventsSaga(eventIds)

  yield put(setLoading(false))
  yield put(notify(`${eventIds.length} event(s) have been deleted.`))
}

function* filterEventsSaga(filterIds) {
  let events = yield select(state => state.events.data)

  let filteredEvents = {}
  for (let key in events) {
    if (filterIds.includes(key)) continue
    filteredEvents[key] = events[key]
  }

  yield put({ type: EVENTS_FILTERED, payload: filteredEvents })
}

function* closeEventSaga({ payload }) {
  const { id, onEventClosed } = payload

  if (
    !(yield confirmDialogSaga(
      `Close event`,
      `Closing an event cannot be undone, are you sure you want to close this event?`,
      `Close`,
    ))
  ) {
    return
  }

  yield put(setLoading(true, `Closing event`))

  yield call(() => closeEvent(id))
  yield loadEventsSaga()

  yield put(setLoading(false))
  onEventClosed()
  yield put(notify(`The event has been closed.`))
}

function* duplicateEventSaga({ payload: { id: copiedEventId, events } }) {
  const copiedEvent = yield select(state => state.events.data[copiedEventId])
  const eventDates = {
    startDate: moment.utc(copiedEvent.start_date),
    endDate: moment.utc(copiedEvent.end_date),
  }

  const dates = yield confirmDialogSaga(
    'Duplicate event',
    null,
    'Next',
    'Cancel',
    eventDates,
  )

  const copyBans = yield confirmDialogSaga(
    `Duplicate Bulletin Board`,
    `Do you want to copy the Bulletin Board as well?`,
    `Yes`,
    `No`,
  )

  const copyEventChecks = yield confirmDialogSaga(
    `Duplicate Event Checks`,
    `Do you want to duplicate the event checks as well?`,
    `Yes`,
    `No`,
  )

  yield put(setLoading(true, `Duplicating an event`))

  const event = yield call(() =>
    duplicateEvent(copiedEventId, {
      copyBans,
      copyEventChecks,
      startDate: dates.start.format(`${CHECK_DATE_FORMAT} HH:mm:ss`),
      endDate: dates.end.format(`${CHECK_DATE_FORMAT} HH:mm:ss`),
    }),
  )

  yield put(setLoading(false))

  yield put({ type: EVENTS_LOADED, payload: [event].concat(events) })
}

function* watch() {
  yield takeEvery(LOAD_EVENTS, loadEventsSaga)
  yield takeEvery(SAVE_EVENTS, prepEventSaga)
  yield takeEvery(DELETE_EVENTS, deleteEventsSaga)
  yield takeEvery(CLOSE_EVENT, closeEventSaga)
  yield takeEvery(DUPLICATE_EVENT, duplicateEventSaga)
}
// exports
export default { reducer, watch }
