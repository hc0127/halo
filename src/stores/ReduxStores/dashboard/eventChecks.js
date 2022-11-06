// imports
import { call, put, select, takeEvery } from 'redux-saga/effects'
import { RESET_EVENT } from './currentEvent'
import { closeDialog, closeSlidingView, commentDialogSaga } from './dashboard'

// api calls
import {
  getEventChecks,
  completeEventCheck,
  reopenEventCheck,
  updateEventCheckAssignees,
  bulkCompleteEventChecks,
} from '../../../api/events'

// helpers
import {
  formatPaginatedUrl,
  formatPaginatedPrevUrl,
} from '../../../utils/helpers'

// constants
export const LOAD_CHECKS = 'CHECKS:LOAD'
const CHECKS_LOADED = 'CHECKS:LOADED'
const CHECK_UPDATED = 'CHECKS:UPDATED'
const CHECK_REMOVED = 'CHECKS:REMOVED'
const COMPLETE_CHECK = 'CHECKS:COMPLETE_ONE'
const REOPEN_CHECK = 'CHECKS:REOPEN_ONE'
const UPDATE_ASSIGNEES_ON_CHECK = 'CHECKS:UPDATE_ASSIGNEES_ON_ONE'
export const MARK_EVENT_CHECK_AS_READ = 'CHECKS:MARK_AS_READ'
const UPDATE_EVENT_CHECK_MESSAGE = 'CHECKS:UPDATE_MARK_AS_READ'
const CHECKS_ADD_ASSIGNEES = 'CHECKS:ADD_ASSIGNEES'
const UPDATE_CHECK_COMPLETION_STATUS = 'CHECKS:UPDATE_CHECK_COMPLETION_STATUS'
const UPDATE_CHECKS_COMPLETION_STATUS = 'CHECKS:UPDATE_CHECKS_COMPLETION_STATUS'
const FILTER_CHECKS = 'CHECKS:FILTER'
const FILTER_CHECKS_DONE = 'CHECKS:FILTER_DONE'
const RESET_ASSIGNEES = 'CHECKS:RESET_ASSIGNEES'
const CHECKS_CLEAR = 'CHECKS:CLEAR'
const CHECKS_LOAD_MORE = 'CHECKS:LOAD_MORE_CHECKS'
const CHECKS_LOAD_MORE_LOADED = 'CHECKS:LOAD_MORE_CHECKS_LOADED'
const CHECK_TOGGLE_COMPLETE = 'CHECK:TOGGLE_COMPLETE'
const CHECKS_TOGGLE_COMPLETE = 'CHECKS:TOGGLE_COMPLETE'
const CHECKS_TOGGLE_COMPLETE_DONE = 'CHECKS:TOGGLE_COMPLETE_DONE'
const CHECKS_COMPLETE = 'CHECKS:COMPLETE'

// actions
export const loadChecks = (isReloading = false, pageNo = 1, pageSize = 40) => ({
  type: LOAD_CHECKS,
  payload: { isReloading, pageNo, pageSize },
})
export const completeCheck = check => ({
  type: COMPLETE_CHECK,
  payload: { check },
})
export const reopenCheck = check => ({
  type: REOPEN_CHECK,
  payload: { check },
})
export const updateAssigneesOnCheck = (check, userIds) => ({
  type: UPDATE_ASSIGNEES_ON_CHECK,
  payload: { check, userIds },
})
export const filterChecks = (filters, isReloading = false, page = 1) => ({
  type: FILTER_CHECKS,
  payload: { filters, isReloading, page },
})
export const loadMoreChecks = (totalChecksOnPage, filters) => ({
  type: CHECKS_LOAD_MORE,
  payload: { totalChecksOnPage, filters },
})
export const clearChecks = () => ({ type: CHECKS_CLEAR })
export const toggleCheckComplete = (checkId, isChecked) => ({
  type: CHECK_TOGGLE_COMPLETE,
  payload: { checkId, isChecked },
})
export const toggleChecksComplete = isChecked => ({
  type: CHECKS_TOGGLE_COMPLETE,
  payload: { isChecked },
})
export const completeChecks = () => ({
  type: CHECKS_COMPLETE,
})

// initial state
const initialState = {
  status: 'loading',
  count: 0,
  isAddingAssignees: null,
  data: {},
  pagination: {},
  filters: {},
}

const reduceChecks = (
  data,
  payload,
  isReloading = false,
  isAddingChecks = false,
) => {
  const checksToAppend = check => {
    return isAddingChecks
      ? { ...data[check.object_id], ...check }
      : { ...check, ...data[check.object_id] }
  }

  return payload.reduce(
    (map, check) => ({
      ...map,
      [check.object_id]: {
        ...data[check.object_id],
        ...check,
        users: isReloading ? [...data[check.object_id].users] : check.users,
      },
    }),
    {},
  )
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET_EVENT:
      return { ...initialState }
    case CHECK_UPDATED:
      return {
        ...state,
        data: { ...state.data, [action.payload.id]: action.payload },
      }
    case CHECK_REMOVED: {
      const tempData = { ...state.data }
      delete tempData[action.payload.id]
      return { ...state, data: tempData }
    }
    case UPDATE_EVENT_CHECK_MESSAGE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.checkId]: {
            ...state.data[action.payload.checkId],
            message_read_list: [
              ...state.data[action.payload.checkId].read_by,
              action.payload.userId,
            ],
          },
        },
      }
    case LOAD_CHECKS:
    case FILTER_CHECKS:
      return {
        ...state,
        status: action.payload.isReloading ? 'reloading' : 'loading',
      }
    case FILTER_CHECKS_DONE:
    case CHECKS_LOADED:
      return {
        ...state,
        status: 'loaded',
        count: action.payload.count,
        data: reduceChecks(state.data, action.payload.checks),
        pagination: action.payload.pagination,
        filters: action.payload.filters,
      }
    case CHECKS_LOAD_MORE_LOADED:
      return {
        ...state,
        status: 'loaded',
        pagination: {
          nextPage: action.payload.nextPage,
          currentPage: action.payload.currentPage,
        },
        data: {
          ...state.data,
          ...reduceChecks(state.data, action.payload.checks),
        },
      }

    case CHECKS_CLEAR:
      return initialState
    case UPDATE_CHECK_COMPLETION_STATUS:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.checkId]: {
            ...state.data[action.payload.checkId],
            completed_comment: action.payload.completed_comment,
            completed_by: action.payload.completed_by,
            status: action.payload.status,
          },
        },
      }
    case UPDATE_CHECKS_COMPLETION_STATUS:
      return {
        ...state,
        data: {
          ...state.data,
          ...reduceChecks(
            state.data,
            action.payload.completedChecks,
            undefined,
            true,
          ),
        },
      }
    case UPDATE_ASSIGNEES_ON_CHECK:
      return { ...state, isAddingAssignees: true }
    case CHECKS_ADD_ASSIGNEES:
      return {
        ...state,
        isAddingAssignees: false,
        data: {
          ...state.data,
          [action.payload.checkId]: {
            ...state.data[action.payload.checkId],
            users: action.payload.userIds,
          },
        },
      }
    case CHECK_TOGGLE_COMPLETE:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.checkId]: {
            ...state.data[action.payload.checkId],
            isChecked: action.payload.isChecked,
          },
        },
      }
    case CHECKS_TOGGLE_COMPLETE_DONE:
      return {
        ...state,
        data: {
          ...state.data,
          ...reduceChecks(state.data, action.payload.checks, undefined, true),
        },
      }
    case RESET_ASSIGNEES:
      return { ...state, isAddingAssignees: null }
    default:
      return state
  }
}

const formatChecks = checks =>
  checks.map(check => ({
    ...check,
    messages: check.messages.map(message => message.object_id),
  }))

function* getChecksData(pageNo, pageSize, searchTerm, eventType, statuses) {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const checkData = yield call(() =>
    getEventChecks(eventId, pageNo, pageSize, searchTerm, eventType, statuses),
  )
  const nextPage = formatPaginatedUrl(checkData)
  const prevPage = formatPaginatedPrevUrl(checkData)
  const isNextPaginationDisabled = checkData.next === null
  const isPrevPaginationDisabled = checkData.previous === null
  const count = checkData.count

  return {
    checks: formatChecks(checkData.results),
    count,
    currentPage: pageNo,
    pagination: {
      nextPage,
      currentPage: pageNo,
      prevPage,
      isNextPaginationDisabled,
      isPrevPaginationDisabled,
    },
    filters: { searchTerm, eventType, statuses },
  }
}

function* loadChecksSaga({ payload: { pageNo, pageSize } }) {
  const payload = yield getChecksData(pageNo, pageSize)

  yield put({ type: CHECKS_LOADED, payload })
}

function* filterChecksSaga({ payload: { filters, isReloading, page } }) {
  const payload = yield getChecksData(
    page,
    40,
    filters.searchTerm,
    filters.eventType,
    filters.statuses.toString(), // joins the statuses as comma separated vals
  )

  yield put({ type: FILTER_CHECKS_DONE, payload: { ...payload, isReloading } })
}

function* loadMoreChecksSaga({ payload: { totalChecksOnPage, filters } }) {
  const calculatedNextPage = Math.round(totalChecksOnPage / 40 + 1)
  const payload = yield getChecksData(
    calculatedNextPage,
    40,
    filters.searchTerm,
    filters.eventType,
    filters.statuses.toString(),
  )

  yield put({ type: CHECKS_LOAD_MORE_LOADED, payload })
}

function* completeCheckSaga({ payload: { check } }) {
  const { success, comment } = yield call(() =>
    commentDialogSaga('Complete Check', null, 'Complete Check', false),
  )
  const userId = yield select(
    ({
      auth: {
        currentUser: { object_id },
      },
    }) => object_id,
  )

  if (!success) {
    return
  }

  yield put({
    type: UPDATE_CHECK_COMPLETION_STATUS,
    payload: {
      checkId: check.object_id,
      completed_comment: comment,
      completed_by: userId,
      status: 'complete',
    },
  })

  yield call(() =>
    completeEventCheck(check.object_id, { completed_comment: comment }),
  )

  yield put(closeDialog())
  yield put(closeSlidingView())
}

function* completeChecksSaga() {
  const eventId = yield select(
    ({
      currentEvent: {
        event: { object_id },
      },
    }) => object_id,
  )
  const userId = yield select(
    ({
      auth: {
        currentUser: { object_id },
      },
    }) => object_id,
  )
  const { success, comment } = yield call(() =>
    commentDialogSaga('Complete Checks', null, 'Complete Checks', false),
  )

  if (!success) {
    return
  }

  const checks = yield select(({ eventChecks: { data } }) => data)
  const completedChecks = Object.values(checks)
    .filter(({ isChecked }) => isChecked)
    .map(check => ({
      ...check,
      completed_comment: comment,
      completed_by: userId,
      status: 'complete',
    }))
  const completedCheckIds = completedChecks.map(({ object_id }) => object_id)

  yield call(() => bulkCompleteEventChecks(eventId, completedCheckIds, comment))

  yield put({
    type: UPDATE_CHECKS_COMPLETION_STATUS,
    payload: { completedChecks },
  })

  yield put(closeDialog())
}

function* reopenCheckSaga({ payload: { check } }) {
  const { success, comment } = yield call(() =>
    commentDialogSaga(
      'Re-open Check',
      'Please provide details for why you re-opening this check.',
      'Re-open Check',
      true,
    ),
  )

  if (!success) {
    return
  }

  yield put({
    type: UPDATE_CHECK_COMPLETION_STATUS,
    payload: {
      checkId: check.object_id,
      completed_comment: comment,
      status: '',
    },
  })

  yield call(() => reopenEventCheck(check.object_id, { comment }))

  yield put(closeDialog())
}

function* updateAssigneesOnCheckSaga({ payload: { check, userIds } }) {
  yield call(() => updateEventCheckAssignees(check.object_id, { userIds }))
  yield put({
    type: CHECKS_ADD_ASSIGNEES,
    payload: { checkId: check.object_id, userIds },
  })
  yield put({ type: RESET_ASSIGNEES })
}

function* markCheckAsReadSaga({ payload: { checkId } }) {
  const userId = yield select(state => state.auth.currentUser.object_id)
  yield put({ type: UPDATE_EVENT_CHECK_MESSAGE, payload: { checkId, userId } })
}

function* checksToggleCompleteSaga({ payload: { isChecked } }) {
  const checks = yield select(({ eventChecks: { data } }) => data)
  const addedChecks = Object.values(checks)
    .filter(({ status }) => status !== 'complete')
    .map(check => ({
      ...check,
      isChecked,
    }))
  yield put({
    type: CHECKS_TOGGLE_COMPLETE_DONE,
    payload: {
      checks: addedChecks,
    },
  })
}

// sagas
function* watch() {
  yield takeEvery(LOAD_CHECKS, loadChecksSaga)
  yield takeEvery(CHECKS_LOAD_MORE, loadMoreChecksSaga)
  yield takeEvery(COMPLETE_CHECK, completeCheckSaga)
  yield takeEvery(REOPEN_CHECK, reopenCheckSaga)
  yield takeEvery(UPDATE_ASSIGNEES_ON_CHECK, updateAssigneesOnCheckSaga)
  yield takeEvery(MARK_EVENT_CHECK_AS_READ, markCheckAsReadSaga)
  yield takeEvery(FILTER_CHECKS, filterChecksSaga)
  yield takeEvery(CHECKS_TOGGLE_COMPLETE, checksToggleCompleteSaga)
  yield takeEvery(CHECKS_COMPLETE, completeChecksSaga)
}

// exports
export default { reducer, watch }
