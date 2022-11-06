// imports
import { call, put, select, takeEvery } from 'redux-saga/effects'
import { RESET_EVENT } from './currentEvent'

import { getStaffGroups } from '../../../api/groups'

import { USER_PERMISSIONS } from '../../../utils/constants'

// constants
export const LOAD_STAFF_GROUPS = 'STAFF_GROUPS:LOAD'
const STAFF_GROUPS_LOADED = 'STAFF_GROUPS:LOADED'
const STAFF_GROUP_UPDATED = 'STAFF_GROUPS:UPDATED'
export const STAFF_GROUP_REMOVED = 'STAFF_GROUPS:REMOVED'

// actions
export const loadStaffGroups = () => ({ type: LOAD_STAFF_GROUPS })

// initial state
const initialState = {
  status: 'loading',
  list: [],
}

const reducer = (state = initialState, action) => {
  let list = [...state.list]
  switch (action.type) {
    case RESET_EVENT:
      return { ...initialState }
    case STAFF_GROUPS_LOADED:
      return { ...state, status: 'loaded', list: action.payload }
    case STAFF_GROUP_UPDATED:
      list = list.filter(({ id }) => id !== action.payload.id)
      list.push(action.payload)
      return { ...state, list }
    case STAFF_GROUP_REMOVED:
      list = list.filter(({ id }) => id !== action.payload.id)
      return { ...state, list }
    default:
      return state
  }
}

function* loadStaffGroupsSaga() {
  const clientId = yield select(
    state => state.currentEvent.event.client.object_id,
  )
  const {
    auth: { currentUser },
  } = yield select(state => state)

  const userGroups = yield call(() => getStaffGroups(clientId))

  const filteredUserGroups = userGroups.filter(group =>
    group.users.includes(currentUser.object_id),
  )

  yield put({
    type: STAFF_GROUPS_LOADED,
    payload:
      currentUser.permission_role === USER_PERMISSIONS.TargetedDashboardUser
        ? filteredUserGroups
        : userGroups,
  })
}

// sagas
function* watch() {
  yield takeEvery(LOAD_STAFF_GROUPS, loadStaffGroupsSaga)
}

// exports
export default { reducer, watch }
