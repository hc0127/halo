import { call, put, takeEvery } from 'redux-saga/effects'

// api calls
import {
  getEventCheckMessages,
  markEventCheckMessageAsRead,
  createEventCheckMessage,
} from '../../../api/events'

import { MARK_EVENT_CHECK_AS_READ } from '../dashboard/eventChecks'

const LOAD_EVENT_CHECK_MESSAGES = 'EVENT_CHECK_MESSAGES:LOAD'
const RELOAD_EVENT_CHECK_MESSAGES = 'EVENT_CHECK_MESSAGES:RELOAD'
const EVENT_CHECK_MESSAGES_LOADED = 'EVENT_CHECK_MESSAGES:LOADED'
const ADD_EVENT_CHECK_MESSAGE = 'EVENT_CHECK_MESSAGES:SINGLE_ADD'
const MARK_MESSAGE_AS_READ = 'EVENT_CHECK_MESSAGES:MARK_AS_READ'
const EVENT_CHECK_DUMMY_MESSAGE_ADDED = 'EVENT_CHECK_MESSAGES:DUMMY_ADDED'
const EVENT_CHECK_DUMMY_MESSAGE_REMOVED = 'EVENT_CHECK_MESSAGES:DUMMY_REMOVED'

export const loadEventCheckMessages = checkId => ({
  type: LOAD_EVENT_CHECK_MESSAGES,
  payload: { checkId },
})

export const reloadEventCheckMessages = checkId => ({
  type: RELOAD_EVENT_CHECK_MESSAGES,
  payload: { checkId },
})

export const addEventCheckMessage = ({ eventCheckId, message, userId }) => ({
  type: ADD_EVENT_CHECK_MESSAGE,
  payload: { eventCheckId, message, userId },
})
export const markMessageAsRead = checkId => ({
  type: MARK_MESSAGE_AS_READ,
  payload: { checkId },
})

const initialState = {
  status: 'loading',
  checkId: null,
  messages: null,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_EVENT_CHECK_MESSAGES:
      return { ...state, status: 'loading' }
    case RELOAD_EVENT_CHECK_MESSAGES:
      return { ...state }
    case EVENT_CHECK_MESSAGES_LOADED:
      return {
        ...state,
        status: 'loaded',
        checkId: action.payload.checkId,
        messages: action.payload.messages,
      }
    case EVENT_CHECK_DUMMY_MESSAGE_ADDED:
      return {
        ...state,
        messages: [...state.messages, action.payload.eventCheckMessage],
      }
    case EVENT_CHECK_DUMMY_MESSAGE_REMOVED: {
      const messages = [...state.messages]
      const ind = messages.indexOf(action.payload.eventCheckMessage)
      if (ind !== -1) {
        messages.splice(ind, 1)
      }

      return { ...state, messages }
    }
    default:
      return state
  }
}

function* loadEventCheckMessagesSaga({ payload: { checkId } }) {
  const messages = yield call(() => getEventCheckMessages(checkId))

  yield put({
    type: EVENT_CHECK_MESSAGES_LOADED,
    payload: { checkId, messages },
  })
}

function* addEventCheckMessageSaga({
  payload: { eventCheckId, message, userId },
}) {
  yield call(() =>
    createEventCheckMessage({
      event_check: eventCheckId,
      user: userId,
      attachment: null,
      message,
    }),
  )
  yield call(() =>
    loadEventCheckMessagesSaga({ payload: { checkId: eventCheckId } }),
  )
}

function* markEventCheckMessageAsReadSaga({ payload }) {
  yield call(() => markEventCheckMessageAsRead(payload.checkId))
  yield put({
    type: MARK_EVENT_CHECK_AS_READ,
    payload: { checkId: payload.checkId },
  })
}

// sagas
function* watch() {
  yield takeEvery(LOAD_EVENT_CHECK_MESSAGES, loadEventCheckMessagesSaga)
  yield takeEvery(RELOAD_EVENT_CHECK_MESSAGES, loadEventCheckMessagesSaga)
  yield takeEvery(ADD_EVENT_CHECK_MESSAGE, addEventCheckMessageSaga)
  yield takeEvery(MARK_MESSAGE_AS_READ, markEventCheckMessageAsReadSaga)
}

// selectors
export const fetchEventCheckMessages = (state, checkId) => {
  const { eventCheckMessages } = state
  if (eventCheckMessages.checkId !== checkId) {
    return null
  }

  return eventCheckMessages.messages
}

export const getEventCheckMessagesLoading = state =>
  state.eventCheckMessages.status === 'loading'

// exports
export default { reducer, watch }
