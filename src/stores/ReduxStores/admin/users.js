// imports
import { call, put, takeEvery, select } from 'redux-saga/effects'
import { CLOSE_DIALOG, confirmDialogSaga } from '../dialog'
import { setLoading, notify } from './admin'
import { UPDATE_CLIENTS_COUNT_LIMITS } from './clients'
import { STAFF_SAVED } from './activeEvent'

// api calls
import {
  getUser,
  getUsers,
  createUser,
  updateUser,
  suspendUsers,
  deleteUsers,
  updatePassword,
  sendPasswordReset,
} from '../../../api/users'

import utils, { formatPaginatedUrl } from '../../../utils/helpers'

// constants
const LOAD_USER = 'USER:LOAD'
const USER_LOADED = 'USER:LOADED'
const LOAD_USERS = 'USERS:LOAD'
const USERS_LOADED = 'USERS:LOADED'
const DELETE_USERS = 'USERS:DELETE'
const SUSPEND_USERS = 'USERS:SUSPEND'
const SAVE_USER = 'USER:SAVE'
const USER_SAVED = 'USER:SAVED'
const UPDATE_USER_PASSWORD = 'USER:UPDATE_PASSWORD'
const SEND_PASSWORD_RESET = 'USER:SEND_RESET_PASSWORD'
const REFRESH_USER = 'USER:REFRESH'
const GET_USER = 'USER:GET'
const GET_USER_LOADED = 'USER:GET_LOADED'
const CLEAR_USER = 'USER:CLEAR'
const CLEAR_USERS = 'USERS:CLEAR'

// actions
export const loadUsersAction = (
  pageNo,
  filterClientId,
  searchTerm,
  pageSize,
) => ({
  type: LOAD_USERS,
  payload: { pageNo, clientId: filterClientId, searchTerm, pageSize },
})
export const deleteUsersAction = (ids, filterClientId, searchTerm) => ({ type: DELETE_USERS, payload: {ids, filterClientId, searchTerm} })

export const suspendUsersAction = ids => ({ type: SUSPEND_USERS, payload: ids })

export const saveUser = (form, isRenderedOnUserPage) => ({
  type: SAVE_USER,
  payload: { form, isRenderedOnUserPage },
})

export const updatePasswordAction = form => ({
  type: UPDATE_USER_PASSWORD,
  payload: form,
})

export const sendPasswordResetAction = user => ({
  type: SEND_PASSWORD_RESET,
  payload: { user },
})

export const refreshUser = () => ({ type: REFRESH_USER })

export const loadUser = userId => ({
  type: GET_USER,
  payload: { userId },
})

export const clearUser = () => ({ type: CLEAR_USER })

export const clearUsers = () => ({ type: CLEAR_USERS })

// initial state
const initialState = {
  status: 'loading',
  data: {},
  activeUser: null,
}

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_USER:
      return { ...state, status: 'loading' }
    case REFRESH_USER:
      return { ...state, status: 'loaded' }
    case USER_LOADED:
      return {
        ...state,
        status: 'loaded',
        data: { ...state.data, [action.payload.id]: action.payload },
      }
    case USERS_LOADED:
      return {
        ...state,
        count: action.payload.count,
        status: 'loaded',
        pageCount: Math.ceil(action.payload.count / 10),
        nextPageNo: action.payload.nextPageNo,
        prevPageNo: action.payload.prevPageNo,
        data: action.payload.users.reduce((map, user) => {
          // eslint-disable-next-line no-param-reassign
          map[user.object_id] = user
          return map
        }, {}),
      }
    case SAVE_USER:
      return { ...state, status: 'saving' }
    case USER_SAVED:
      return {
        ...state,
        status: 'saved',
        data: {
          ...state.data,
          [action.payload.object_id]: {
            ...state.data[action.payload.object_id],
            ...action.payload,
          },
        },
        activeUser: {
          ...state.data,
          ...action.payload,
        },
      }
    case STAFF_SAVED:
      return { ...state, status: 'saved' }
    case GET_USER_LOADED:
      return {
        ...state,
        activeUser: action.payload.user,
      }
    case CLEAR_USER:
      return { ...state, activeUser: null }
    case CLEAR_USERS:
      return { ...state, data: {} }
    default:
      return state
  }
}

const formatUsers = users =>
  users.results.map(user => ({
    ...user,
    pin: user.pin.toLowerCase(),
  }))

function* getRetainedSearchTerm() {
  const filterValues = yield select(store => store.admin.filterValues)
  const [searchParam] = Object.keys(filterValues)

  return searchParam === 'users' ? filterValues.users : ''
}

// sagas
export function* loadUsersSaga({ payload }) {
  const retainedSearchTerm = yield call(() => getRetainedSearchTerm())
  const users = yield call(() =>
    getUsers(
      payload.pageNo,
      payload.clientId,
      retainedSearchTerm || '',
      payload.pageSize,
    ),
  )

  const nextPageNo = formatPaginatedUrl(users)
  const prevPageNo = nextPageNo === 1 ? nextPageNo + 1 : nextPageNo - 2

  const formattedUsers = formatUsers(users)

  yield put({
    type: USERS_LOADED,
    payload: {
      users: formattedUsers,
      nextPageNo,
      prevPageNo,
      count: users.count,
    },
  })
}

function* suspendUsersSaga({ payload: userIds }) {
  if (
    !(yield confirmDialogSaga(
      `Suspend users`,
      `Are you sure you want to suspend user(s)?`,
      `Suspend`,
    ))
  ) {
    return
  }

  yield put(setLoading(true, `Suspending ${userIds.length} user(s)`))

  yield call(() => suspendUsers(userIds))

  yield put(setLoading(false))
  yield put(notify(`${userIds.length} user(s) have been suspended.`))
  yield put(loadUsersAction(1,'','',10))

}

function* deleteUsersSaga({ payload }) {
  if (
    !(yield confirmDialogSaga(
      `Delete users`,
      `Are you sure you want to delete user(s)?`,
      `Delete`,
    ))
  ) {
    return
  }

  yield put(setLoading(true, `Deleting ${payload.ids.length} user(s)`))

  yield call(() => deleteUsers(payload.ids))
  yield put(loadUsersAction(1, payload.filterClientId, payload.searchTerm, 10))

  yield put(setLoading(false))
  yield put(notify(`${payload.ids.length} user(s) have been deleted.`))
}

function* saveUserSaga({
  payload: {
    form: {
      id,
      username,
      email,
      clientId,
      name,
      mobileNumber,
      password,
      role,
      permissionRole,
      suspended,
      pin,
      customPinFile,
    },
    isRenderedOnUserPage,
  },
}) {
  let userDetails = {
    name,
    username,
    email,
    permission_role: permissionRole,
    client: clientId,
    role,
    pin: pin.toLowerCase() || 'standard',
    password,
    suspended,
    mobile_number: mobileNumber,
  }

  const actionToDispatch = isRenderedOnUserPage ? USER_SAVED : STAFF_SAVED

  const userCustomPin = yield call(() => utils.base64EncodeFile(customPinFile))
  if (userCustomPin) {
    userDetails = { ...userDetails, pin_icon_url: userCustomPin }
  }

  const user = yield call(() =>
    id ? updateUser({ userId: id, ...userDetails }) : createUser(userDetails),
  )

  const payloadToSend = id ? { user, id } : user

  // // if dialog is open, close it and call callback
  const dialog = yield select(state => state.dialog)

  if (user.client) {
    yield put({
      type: UPDATE_CLIENTS_COUNT_LIMITS,
      payload: {
        type: 'staffCounts',
        value: 1,
        clientId: user.client.object_id,
      },
    })
  }

  yield put({
    type: actionToDispatch,
    payload: payloadToSend,
  })

  if (dialog.open) {
    yield put({ type: CLOSE_DIALOG })
  }
}

function* updateUserPasswordSaga({ payload: { id, password } }) {
  yield call(() => updatePassword(id, password))

  yield put({ type: CLOSE_DIALOG })
  yield put(notify(`Password updated.`))
}

function* sendPasswordResetSaga({ payload: { user } }) {
  yield call(() => sendPasswordReset(user.email))
  yield put({ type: CLOSE_DIALOG })
  yield put(notify(`Password reset email sent.`))
}

function* getUserSaga({ payload: { userId } }) {
  const user = yield call(() => getUser(userId))

  yield put({ type: GET_USER_LOADED, payload: { user } })
}

function* watch() {
  yield takeEvery(SAVE_USER, saveUserSaga)
  yield takeEvery(LOAD_USERS, loadUsersSaga)
  yield takeEvery(SUSPEND_USERS, suspendUsersSaga)
  yield takeEvery(DELETE_USERS, deleteUsersSaga)
  yield takeEvery(UPDATE_USER_PASSWORD, updateUserPasswordSaga)
  yield takeEvery(SEND_PASSWORD_RESET, sendPasswordResetSaga)
  yield takeEvery(GET_USER, getUserSaga)
}

// exports
export default { reducer, watch }
