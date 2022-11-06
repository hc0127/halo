// imports
import { call, put, takeEvery } from 'redux-saga/effects'
import { confirmDialogSaga } from '../dialog'
import { setLoading, notify } from './admin'

// api calls
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroups,
} from '../../../api/groups'

import utils from '../../../utils/helpers'

// constants
const LOAD_GROUPS = 'GROUPS:LOAD'
const GROUPS_LOADED = 'GROUPS:LOADED'
const DELETE_GROUPS = 'GROUPS:DELETE'
const SAVE_GROUP = 'GROUP:SAVE'
const GROUP_SAVED = 'GROUP:SAVED'
const REFRESH_GROUP = 'GROUP:REFRESH'

// actions
export const loadGroupsAction = () => ({ type: LOAD_GROUPS })
export const deleteGroupsAction = ids => ({ type: DELETE_GROUPS, payload: ids })
export const saveGroup = form => ({ type: SAVE_GROUP, payload: form })
export const refreshGroup = () => ({ type: REFRESH_GROUP })

// initial state
const initialState = {
  status: 'loading',
  data: {},
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case REFRESH_GROUP:
      return { ...state, status: 'loaded' }
    case GROUPS_LOADED:
      return {
        ...state,
        status: 'loaded',
        data: action.payload.reduce((map, group) => {
          // eslint-disable-next-line no-param-reassign
          map[group.object_id] = group
          return map
        }, {}),
      }
    case SAVE_GROUP:
      return { ...state, status: 'saving' }
    case GROUP_SAVED:
      return { ...state, status: 'saved' }
    default:
      return state
  }
}

export function* loadGroupsSaga() {
  const groups = yield call(() => getGroups())

  yield put({ type: GROUPS_LOADED, payload: groups })
}

function* saveGroupSaga({ payload: { id, name, clientId, users, iconFile } }) {
  let groupDetails = {
    client: clientId,
    name,
    users,
  }
  let groupIcon

  if (iconFile?.type.includes('svg')) {
    groupIcon = yield call(() => utils.convertSvgtoPng(iconFile))
  } else {
    groupIcon = yield call(() => utils.base64EncodeFile(iconFile))
  }

  if (groupIcon) {
    groupDetails = { ...groupDetails, icon_file: groupIcon }
  }
  const group = yield call(() =>
    id
      ? updateGroup({ groupId: id, ...groupDetails })
      : createGroup(groupDetails),
  )

  yield loadGroupsSaga()

  yield put({ type: GROUP_SAVED, payload: group })
}

function* deleteGroupsSaga({ payload: groupIds }) {
  if (
    !(yield confirmDialogSaga(
      `Delete teams`,
      `Are you sure you want to delete teams(s)?`,
      `Delete`,
    ))
  ) {
    return
  }

  yield put(setLoading(true, `Deleting ${groupIds.length} teams(s)`))

  yield call(() => deleteGroups(groupIds))

  yield loadGroupsSaga()

  yield put(setLoading(false))
  yield put(notify(`${groupIds.length} teams(s) have been deleted.`))
}

// sagas
function* watch() {
  yield takeEvery(LOAD_GROUPS, loadGroupsSaga)
  yield takeEvery(SAVE_GROUP, saveGroupSaga)
  yield takeEvery(DELETE_GROUPS, deleteGroupsSaga)
}

// exports
export default { reducer, watch }
