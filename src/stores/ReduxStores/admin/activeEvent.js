// imports
import { call, put, take, takeEvery, select } from 'redux-saga/effects'
import { notify } from './admin'

import {
  // getEvent,
  getEventHaloChecks,
  // getEventGeofences,
  // createEvent,
  // updateEvent,
} from '../../../api/events'

import { getEvent } from '../../../appsync-service/queries/event'
import {
  updateEvent,
  createEvent,
} from '../../../appsync-service/mutations/event'

import {
  bulkUpdateHaloChecks,
  deleteAdminCheck,
  createAdminCheck,
  updateAdminCheck,
} from '../../../api/admin-checks'

import { SAVE_EVENT_GEOFENCES, EVENT_GEOFENCES_SAVED } from './geofences'

import utils, {
  formatPaginatedUrl,
  getUniqueListBy,
  filterSuspendedUsers,
  filterUnnasignedUsersFromChecks,
} from '../../../utils/helpers'
import { getStaff } from '../../../api/users'
import { setLoading } from './admin'
import moment from 'moment'

const initialState = {
  isLoading: false,
  isSaving: false,
  data: null,
  isLoadingMoreData: false,
}

// actions
const GET_EVENT = 'EVENT_GET'
const GET_EVENT_LOADING = 'EVENT_GET:LOADING'
const GET_EVENT_LOADED = 'EVENT_GET:LOADED'

const CLEAR_EVENT = 'EVENT_GET:CLEAR'

export const PREP_EVENT_SAVE = 'EVENT:PREP'
const POST_EVENT = 'EVENT:SAVE'
const POST_EVENT_SAVED = 'EVENT:SAVED'

const LOAD_MORE_CHECKS = 'CHECKS:LOAD_MORE'
const LOAD_MORE_CHECKS_LOADED = 'CHECKS:LOAD_MORE_LOADED'
const LOAD_UPDATED_CHECKS = 'CHECKS:LOAD_UPDATED_CHECKS'

const SEARCH_HALO_CHECKS = 'CHECKS:SEARCH_HALO_CHECKS'
const SEARCH_HALO_CHECKS_COMPLETE = 'CHECKS:SEARCH_HALO_CHECKS_COMPLETE'

const CREATE_HALO_CHECK = 'CHECK:CREATE'
const CREATE_HALO_CHECK_COMPLETE = 'CHECK:CREATE_COMPLETE'
const UPDATE_HALO_CHECK = 'CHECK:UPDATE'
const UPDATE_HALO_CHECK_COMPLETE = 'CHECK:UPDATE_COMPLETE'

const LOAD_CLIENT_STAFF = 'STAFF:LOAD_CLIENT'
const LOAD_CLIENT_STAFF_LOADED = 'STAFF:LOAD_CLIENT_LOADED'
const DELETE_HALO_CHECK = 'CHECK:DELETE'

export const STAFF_SAVED = 'STAFF:SAVED'

export const getEventAction = eventId => ({
  type: GET_EVENT,
  payload: { eventId },
})

export const loadMoreHaloChecks = (nextPage, searchTerm) => ({
  type: LOAD_MORE_CHECKS,
  payload: { nextPage, searchTerm },
})

export const clearEventAction = () => ({ type: CLEAR_EVENT })

export const createHaloCheck = haloCheck => ({
  type: CREATE_HALO_CHECK,
  payload: haloCheck,
})

export const deleteHaloChecks = haloChecks => ({
  type: DELETE_HALO_CHECK,
  payload: haloChecks,
})

export const updateHaloCheck = haloCheck => ({
  type: UPDATE_HALO_CHECK,
  payload: haloCheck,
})

export const searchHaloChecks = (haloChecks, pageNo) => ({
  type: SEARCH_HALO_CHECKS,
  payload: { haloChecks, pageNo },
})

export const getClientUsers = clientId => ({
  type: LOAD_CLIENT_STAFF,
  payload: { clientId },
})

// event
export function* getEventSaga({ payload: { eventId } }) {
  yield put({ type: GET_EVENT_LOADING, payload: true })

  let event = yield call(() => getEvent(eventId))
  event = { ...event }

  if (event.custom_logo_file === '') event.custom_logo_file = null
  if (event.brief_file === '') event.brief_file = null

  const { results, nextPageNo, count } = yield call(() =>
    getHaloChecks(eventId),
  )
  // const geofences = yield call(() => getEventGeofences(eventId))
  let geofences = event.locations

  const staff = yield call(() => getStaff(event.client.object_id))

  const filteredSuspendedActiveUsers = filterSuspendedUsers(staff, event.users)

  event.users = filteredSuspendedActiveUsers

  const filteredAdminChecks = filterUnnasignedUsersFromChecks(
    results,
    filteredSuspendedActiveUsers,
  )

  const formattedEvent = {
    ...event,
    locations: geofences?.map(location => ({
      ...location,
      points: utils.formatPoints(location.points.coordinates),
    })),
    checks: { results: filteredAdminChecks, nextPageNo, count },
    staff,
  }

  yield put({
    type: GET_EVENT_LOADED,
    payload: formattedEvent,
  })
}

export function* saveEventSaga({
  payload: {
    eventId,
    haloChecks,
    deletedHaloChecks,
    geofenceData: { initialGeoFences, mutatedGeoFences },
    duplicatedChecks,
    eventDetails,
    afterEventSave,
  },
}) {
  const isUpdating = Boolean(eventId)

  const event = yield call(() =>
    isUpdating
      ? updateEvent({
          id: eventId,
          ...eventDetails,
        })
      : createEvent({ ...eventDetails }),
  )

  if (isUpdating) {
    yield put({ type: POST_EVENT, payload: event })
  }
  yield put({
    type: SAVE_EVENT_GEOFENCES,
    payload: {
      event: event.object_id,
      initialGeoFences,
      mutatedGeoFences,
    },
  })
  yield take(EVENT_GEOFENCES_SAVED)
  yield put({ type: POST_EVENT_SAVED })

  yield put(setLoading(false))

  isUpdating
    ? yield put(notify(`event have been updated.`))
    : yield put(notify(`event have been created.`))

  afterEventSave(event.object_id)
}

// halo checks
export const getHaloChecks = async (eventId, nextPage = 1, searchTerm = '') => {
  const haloChecks = await getEventHaloChecks(eventId, nextPage, searchTerm)

  const nextPageNo = formatPaginatedUrl(haloChecks)
  const haloChecksCount = haloChecks.count
  const results = utils.formatHaloChecks(haloChecks.results)

  return {
    results,
    count: haloChecksCount,
    nextPageNo,
  }
}

function* createHaloCheckSaga({ payload }) {
  const { object_id: eventId } = yield select(
    ({ activeEvent: { data } }) => data,
  )

  const haloCheck = yield call(() =>
    createAdminCheck({ event: eventId, ...payload }),
  )

  yield put({
    type: CREATE_HALO_CHECK_COMPLETE,
    payload: {
      haloCheck: {
        ...haloCheck,
        start_at_time: formatTime(haloCheck.start_at_time),
        recurring_end_at_time: haloCheck.recurring_end_at_time
          ? formatTime(haloCheck.recurring_end_at_time)
          : null,
      },
    },
  })
}

function* updateHaloCheckSaga({ payload }) {
  const haloCheck = yield call(() => updateAdminCheck(payload))

  yield put({ type: UPDATE_HALO_CHECK_COMPLETE, payload: { haloCheck } })
}

function* searchHaloChecksSaga({ payload: { haloChecks, pageNo } }) {
  yield put({
    type: SEARCH_HALO_CHECKS_COMPLETE,
    payload: { haloChecks, pageNo },
  })
}

function* loadMoreHaloChecksSaga({ payload: { nextPage, searchTerm } }) {
  const eventId = yield select(state => state.activeEvent.data.object_id)
  const additionalHaloChecks = yield call(() =>
    getHaloChecks(eventId, nextPage, searchTerm),
  )

  yield put({ type: LOAD_MORE_CHECKS_LOADED, payload: additionalHaloChecks })
}

// halo checks - helpers
const formatTime = time => `${time.split(':')[0]}:${time.split(':')[1]}`

const updateHaloCheckItem = (haloChecks, haloCheck) => {
  const idx = haloChecks.findIndex(
    ({ object_id }) => object_id === haloCheck.object_id,
  )

  haloChecks[idx] = {
    ...haloCheck,
    start_at_time: formatTime(haloCheck.start_at_time),
    recurring_end_at_time: haloCheck.recurring_end_at_time
      ? formatTime(haloCheck.recurring_end_at_time)
      : null,
  }

  return haloChecks
}

function* getClientUsersSaga({ payload: { clientId } }) {
  const clientUsers = yield call(() => getStaff(clientId))

  yield put({ type: LOAD_CLIENT_STAFF_LOADED, payload: clientUsers })
}

function* deleteHaloChecksSaga({ payload }) {
  for (let idx in payload) {
    const deletedCheck = payload[idx]
    try {
      yield call(() => deleteAdminCheck(deletedCheck.id))
    } catch (error) {
      alert(error.data.detail)
      const resetTime = moment()
        .set({ hour: '00', minute: '00' })
        .format('HH:mm')
      let updatedCheck = {
        ...deletedCheck,
        adminCheckId: deletedCheck.id,
        start_at: moment().format('YYYY-MM-DD'),
        recurring_end_at: moment().format('YYYY-MM-DD'),
        recurring_end_at_time: resetTime,
      }
      yield put({
        type: UPDATE_HALO_CHECK,
        payload: updatedCheck,
      })
    }
  }
}

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_EVENT_LOADING:
      return { ...state, isLoading: action.payload }
    case GET_EVENT_LOADED:
      return {
        ...state,
        isLoading: false,
        data: { ...action.payload },
      }

    case POST_EVENT:
      return {
        ...state,
        isSaving: true,
        data: {
          ...state.data,
          ...action.payload,
        },
      }
    case POST_EVENT_SAVED:
      return {
        ...state,
        isSaving: false,
      }
    case LOAD_MORE_CHECKS:
      return {
        ...state,
        isLoadingMoreData: true,
      }

    case LOAD_MORE_CHECKS_LOADED:
      return {
        ...state,
        isLoadingMoreData: false,
        data: {
          ...state.data,
          checks: {
            ...action.payload,
            results: getUniqueListBy([...action.payload.results], 'object_id'),
          },
        },
      }
    case LOAD_UPDATED_CHECKS:
      return {
        ...state,
        data: {
          ...state.data,
          checks: {
            ...state.data.checks,
            results: action.payload,
          },
        },
      }
    case CREATE_HALO_CHECK_COMPLETE:
      return {
        ...state,
        data: {
          ...state.data,
          checks: {
            ...state.data.checks,
            results: [...state.data.checks.results, action.payload.haloCheck],
          },
        },
      }
    case UPDATE_HALO_CHECK_COMPLETE:
      return {
        ...state,
        data: {
          ...state.data,
          checks: {
            ...state.data.checks,
            results: updateHaloCheckItem(
              state.data.checks.results,
              action.payload.haloCheck,
            ),
          },
        },
      }
    case SEARCH_HALO_CHECKS_COMPLETE:
      return {
        ...state,
        data: {
          ...state.data,
          checks: {
            ...state.data.checks,
            nextPageNo: action.payload.pageNo,
            results: action.payload.haloChecks,
          },
        },
      }
    case STAFF_SAVED:
      return {
        ...state,
        data: {
          ...state.data,
          staff: createOrEditStaff(state.data.staff, action.payload),
        },
      }
    case LOAD_CLIENT_STAFF_LOADED:
      return {
        ...state,
        data: {
          staff: action.payload,
        },
      }
    case CLEAR_EVENT:
      return { ...state, data: null }
    default:
      return state
  }
}

const createOrEditStaff = (staff, payload) => {
  const { user, id } = payload

  if (id) {
    const staffIdx = staff.findIndex(
      ({ object_id }) => object_id === user.object_id,
    )
    staff[staffIdx] = { ...staff[staffIdx], ...user }
    return staff
  } else {
    return [payload, ...staff]
  }
}

function* watch() {
  yield takeEvery(GET_EVENT, getEventSaga)
  yield takeEvery(PREP_EVENT_SAVE, saveEventSaga)
  yield takeEvery(CREATE_HALO_CHECK, createHaloCheckSaga)
  yield takeEvery(UPDATE_HALO_CHECK, updateHaloCheckSaga)
  yield takeEvery(LOAD_MORE_CHECKS, loadMoreHaloChecksSaga)
  yield takeEvery(SEARCH_HALO_CHECKS, searchHaloChecksSaga)
  yield takeEvery(LOAD_CLIENT_STAFF, getClientUsersSaga)
  yield takeEvery(DELETE_HALO_CHECK, deleteHaloChecksSaga)
}

export default { reducer, watch }
