// imports
import { call, put, takeEvery } from 'redux-saga/effects'

import { login } from '../../api/auth'
import { getCurrentUser } from '../../api/users'

// constants
const LOGIN = 'AUTH:LOGIN'
const LOGOUT = 'AUTH:LOGOUT'
const LOGGED_IN = 'AUTH:LOGGED_IN'
export const LOGGED_OUT = 'AUTH:LOGGED_OUT'
const LOGIN_FAILED = 'AUTH:LOGIN_FAILED'
export const UPDATED_LOGIN_USER = 'AUTH:UPDATED_USER'
const UPDATED_LOGIN_USER_CLIENT = 'AUTH:UPDATED_USER_CLIENT'
const AUTH_SET_USER = 'AUTH:SET_USER'
const AUTH_SET_USER_SAGA = 'AUTH:SET_USER'
const AUTH_SET_LOADING = 'AUTH:SET_LOADING'

// actions
export const loginAction = (username, password) => ({
  type: LOGIN,
  payload: { username, password },
})
export const setUser = user => ({ type: AUTH_SET_USER_SAGA, payload: user })
export const logout = () => ({ type: LOGOUT })
export const setLoading = isLoading => ({
  type: AUTH_SET_LOADING,
  payload: isLoading,
})

// initial state
const initialState = {
  currentUser: {},
  error: '',
  isLoading: true,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATED_LOGIN_USER:
    case AUTH_SET_USER:
      return { ...state, currentUser: action.payload, isLoading: false }
    case LOGGED_IN:
      return { ...state, currentUser: action.payload }
    case LOGGED_OUT:
      return { ...state, currentUser: {} }
    case LOGIN_FAILED:
      return { ...state, error: action.payload }
    case AUTH_SET_LOADING:
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

function* loginSaga({ payload: { username, password } }) {
  try {
    const { access, refresh } = yield call(() => login(username, password))
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)

    yield put({ type: AUTH_SET_LOADING, payload: true })
    const user = yield call(() => getCurrentUser())
    localStorage.setItem('user', JSON.stringify(user))
    yield put({ type: AUTH_SET_LOADING, payload: false })

    yield put({ type: LOGGED_IN, payload: user })
  } catch (err) {
    yield put({ type: LOGIN_FAILED, payload: err.detail })
  }
}

function* logoutSaga() {
  localStorage.clear()
  yield put({ type: LOGGED_OUT })
}

function* logoutIfSuspended({ payload: client }) {
  if (client.get('suspended')) {
    yield call(logoutSaga)
  }
}

function* setUserSaga() {
  const user = yield call(() => getCurrentUser())
  localStorage.setItem('user', JSON.stringify(user))
  put({ type: AUTH_SET_USER, payload: user })
}

// sagas
function* watch() {
  yield takeEvery(UPDATED_LOGIN_USER_CLIENT, logoutIfSuspended)

  yield takeEvery(LOGIN, loginSaga)
  yield takeEvery(LOGOUT, logoutSaga)

  yield takeEvery(AUTH_SET_USER_SAGA, setUserSaga)
}

// exports
export default { reducer, watch }
