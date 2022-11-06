// imports
import { put, take } from 'redux-saga/effects'
import { DIALOG_TYPE } from '../../utils/constants'

// constants
export const SHOW_DIALOG = 'DIALOG:SHOW'
export const CLOSE_DIALOG = 'DIALOG:CLOSE'
export const CONFIRM_DIALOG = 'DIALOG:CONFIRM'
export const SET_RESOLVE_VARIATION = 'RESOLVE:VARIATION'

// actions
export const openDialog = config => ({ type: SHOW_DIALOG, payload: config })
export const closeDialog = () => ({ type: CLOSE_DIALOG })
export const confirmDialog = hasConfirmed => ({
  type: CONFIRM_DIALOG,
  payload: hasConfirmed,
})
export const setResolveVariation = resolveVariation => ({
  type: SET_RESOLVE_VARIATION,
  payload: resolveVariation,
})

export const openConfirmDialog = (
  title,
  message,
  buttonTextConfirm,
  buttonTextCancel,
  dates,
) => ({
  type: SHOW_DIALOG,
  payload: {
    type: DIALOG_TYPE.Confirm,
    message,
    title,
    buttonTextConfirm,
    buttonTextCancel,
    dates,
  },
})

// initial state
const initialState = {
  open: false,
  type: null,
  userId: null,
  onUserCreated: () => {},
  key: 0,
  newGroup: false,
  groupId: null,
  dates: {},
  beaconId: null,
  resolveVariation: 'resolve',
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_DIALOG:
      // reset the state everytime you show a new dialog
      return {
        ...initialState,
        key: state.key + 1,
        open: true,
        ...action.payload,
      }
    case CLOSE_DIALOG:
    case CONFIRM_DIALOG:
      return { ...state, open: false, delayedAction: null }
    case SET_RESOLVE_VARIATION:
      return { ...state, resolveVariation: action.payload }
    default:
      return state
  }
}

// sagas
export function* confirmDialogSaga(
  title,
  message,
  buttonTextConfirm,
  buttonTextCancel,
  dates,
) {
  yield put(
    openConfirmDialog(
      title,
      message,
      buttonTextConfirm,
      buttonTextCancel,
      dates,
    ),
  )

  const { payload: hasConfirmed } = yield take(CONFIRM_DIALOG)

  return hasConfirmed
}

function* watch() {}

// exports
export default { reducer, watch }
