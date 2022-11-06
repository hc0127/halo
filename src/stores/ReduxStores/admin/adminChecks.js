// imports
import { call, put, takeEvery } from 'redux-saga/effects'

import utils from '../../../utils/helpers'

// api calls
import {
  getAdminChecks,
  createAdminCheck,
  updateAdminCheck,
  deleteAdminCheck,
} from '../../../api/admin-checks'

// constants
export const LOAD_HALO_CHECKS = 'HALO_CHECKS:LOAD'
export const HALO_CHECKS_LOADED = 'HALO_CHECKS:LOADED'
export const SAVE_EVENT_HALO_CHECKS = 'HALO_CHECKS:EVENT_SAVE'
export const EVENT_HALO_CHECKS_SAVED = 'HALO_CHECKS:EVENT_SAVED'

// actions
export const loadHaloChecksAction = () => ({ type: LOAD_HALO_CHECKS })

// initial state
const initialState = {
  status: 'loading',
  list: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_HALO_CHECKS:
      return { ...state, status: 'loading' }
    case HALO_CHECKS_LOADED:
      return {
        ...state,
        status: 'loaded',
        list: action.payload,
      }
    case SAVE_EVENT_HALO_CHECKS:
      return { ...state, status: 'saving' }
    case EVENT_HALO_CHECKS_SAVED:
      return { ...state, status: 'saved' }
    default:
      return state
  }
}

function* loadHaloChecksSaga() {
  const checks = yield call(() => getAdminChecks())
  const formatTime = time => `${time.split(':')[0]}:${time.split(':')[1]}`
  const formattedChecks = checks.map(check => ({
    ...check,
    start_at_time: formatTime(check.start_at_time),
    recurring_end_at_time: check.recurring_end_at_time
      ? formatTime(check.recurring_end_at_time)
      : null,
  }))

  yield put({ type: HALO_CHECKS_LOADED, payload: formattedChecks })
}

function* saveEventHaloChecksSaga({ payload }) {
  const deletedChecks =
    payload.initialAdminChecks.filter(
      initialCheck =>
        !payload.mutatedAdminChecks.some(
          mutatedCheck => mutatedCheck.object_id === initialCheck.object_id,
        ),
    ) || []
  for (let idx in payload.mutatedAdminChecks) {
    const adminCheck = payload.mutatedAdminChecks[idx]
    let checkImg
    if (adminCheck.image.url) {
      checkImg = adminCheck.image
    } else {
      checkImg = yield call(() => utils.base64EncodeFile(adminCheck.image))
    }

    let adminCheckData = {
      title: adminCheck.title,
      description: adminCheck.description || adminCheck.descriptionString,
      users: adminCheck.users,
      event: payload.event.object_id,
      zones: adminCheck.zones,
      event_type: adminCheck.event_type || adminCheck.type,
      start_at: adminCheck.start_at || adminCheck.startAt,
      start_at_time: adminCheck.start_at_time || adminCheck.startAtTime,
      recurring_end_at:
        adminCheck.recurring_end_at || adminCheck.recurringEndAt,
      recurring_end_at_time:
        adminCheck.recurring_end_at_time || adminCheck.recurringEndAtTime,
      recurring_period:
        adminCheck.recurring_period || adminCheck.recurringPeriod,
    }
    if (checkImg) {
      adminCheckData = { ...adminCheckData, image: checkImg }
    }
    if (adminCheck.object_id) {
      // update admin checks
      yield call(() =>
        updateAdminCheck({
          ...adminCheckData,
          adminCheckId: adminCheck.object_id,
        }),
      )
    } else {
      // create admin checks
      yield call(() => createAdminCheck(adminCheckData))
    }
  }
  if (deletedChecks.length) {
    // delete admin checks
    for (let idx in deletedChecks) {
      const deletedCheck = deletedChecks[idx]
      yield call(() => deleteAdminCheck(deletedCheck.object_id))
    }
  }
  yield put({ type: EVENT_HALO_CHECKS_SAVED })
}

// sagas
function* watch() {
  yield takeEvery(LOAD_HALO_CHECKS, loadHaloChecksSaga)
  yield takeEvery(SAVE_EVENT_HALO_CHECKS, saveEventHaloChecksSaga)
}

// exports
export default { reducer, watch }
