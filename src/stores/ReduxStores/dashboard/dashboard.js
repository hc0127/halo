// imports
import { put, takeEvery, select, take } from 'redux-saga/effects'
import { EVENT_GEOFENCES_UPDATED } from './eventGeofences'
import { STAFF_GROUP_REMOVED } from './staffGroups'
import {
  DASHBOARD_RIGHT_PANEL_VIEW,
  DIALOG_TYPE,
} from '../../../utils/constants'

import { sendPushNotification } from '../../../api/push-notifications'

// constants
const SET_MAP_CENTER = 'DASHBOARD:SET_MAP_CENTER'
const FILTER_BY_GEOFENCE = 'DASHBOARD:FILTER_BY_GEOFENCE'
const FILTER_BY_USER_GROUP = 'DASHBOARD:FILTER_BY_USER_GROUP'
const RESET_FILTERS = 'DASHBOARD:RESET_FILTERS'
const OPEN_INCIDENT_FORM = 'DASHBOARD:OPEN_INCIDENT_FORM'
const OPEN_INCIDENT_VIEW = 'DASHBOARD:OPEN_INCIDENT_VIEW'
const CLOSE_SLIDING_VIEW = 'DASHBOARD:CLOSE_SLIDING_VIEW'
const OPEN_DIALOG = 'DASHBOARD:OPEN_DIALOG'
const CONFIRM_DIALOG = 'DASHBOARD:CONFIRM_DIALOG'
const ON_COMMENT_DIALOG = 'DASHBOARD:ON_COMMENT_DIALOG'
const CLOSE_DIALOG = 'DASHBOARD:CLOSE_DIALOG'
const EVACUATE_SITE = 'DASHBOARD:EVACUATE_SITE'
const LOCKDOWN_ZONE = 'DASHBOARD:LOCKDOWN_ZONE'
const SEND_NOTIFICATION = 'DASHBOARD:SEND_NOTIFICATION'
const GEOFENCES_REDRAWN = 'DASHBOARD:GEOFENCES_REDRAWN'
const OPEN_EDIT_BAN_FORM = 'DASHBOARD:OPEN_EDIT_BAN_FORM'
const CHANGE_RIGHT_PANEL_VIEW = 'DASHBOARD:CHANGE_RIGHT_PANEL_VIEW'
const OPEN_EDIT_CHECK_VIEW = 'DASHBOARD:OPEN_EDIT_CHECK_VIEW'
const UPDATE_INCIDENT = 'DASHBOARD:UPDATE_INCIDENT'
const UPDATE_BAN_INCIDENT = 'DASHBOARD:UPDATE_BAN_INCIDENT'

// actions
export const setMapCenter = ({ latitude, longitude }) => ({
  type: SET_MAP_CENTER,
  payload: { latitude, longitude },
})
export const setGeofenceFilter = geofenceId => ({
  type: FILTER_BY_GEOFENCE,
  payload: geofenceId,
})
export const resetFilters = () => ({ type: RESET_FILTERS })
export const openIncidentForm = () => ({ type: OPEN_INCIDENT_FORM })
export const updateIncidentForm = () => ({
  type: UPDATE_INCIDENT,
})
export const updateBanIncidentForm = () => ({
  type: UPDATE_BAN_INCIDENT,
})
export const openIncidentView = incidentId => ({
  type: OPEN_INCIDENT_VIEW,
  payload: incidentId,
})
export const closeSlidingView = () => ({ type: CLOSE_SLIDING_VIEW })
export const openDialog = (type, props) => ({
  type: OPEN_DIALOG,
  payload: { type, props },
})
export const closeDialog = () => ({ type: CLOSE_DIALOG })
export const confirmDialog = () => ({ type: CONFIRM_DIALOG, payload: true })
export const commentDialog = comment => ({
  type: ON_COMMENT_DIALOG,
  payload: { comment },
})
export const setGroupFilter = groupId => ({
  type: FILTER_BY_USER_GROUP,
  payload: groupId,
})
export const evacuateSite = message => ({
  type: EVACUATE_SITE,
  payload: { message },
})
export const lockdownZone = message => ({
  type: LOCKDOWN_ZONE,
  payload: { message },
})
export const sendNotification = message => ({
  type: SEND_NOTIFICATION,
  payload: { message },
})
export const resetGeofenceRedraw = () => ({ type: GEOFENCES_REDRAWN })
export const openEditBanForm = banId => ({
  type: OPEN_EDIT_BAN_FORM,
  payload: banId,
})
export const changeRightPanelView = view => ({
  type: CHANGE_RIGHT_PANEL_VIEW,
  payload: view,
})
export const openEditCheckView = checkId => ({
  type: OPEN_EDIT_CHECK_VIEW,
  payload: checkId,
})

// initial state
const initialState = {
  mapCenter: null,
  geofenceIdFilter: '',
  groupIdFilter: '',
  openedIncidentId: '',
  incidentFormOpened: false,
  openedDialog: false,
  dialogType: '',
  dialogKey: 0,
  dialogProps: {},
  redrawGeofences: false,
  editBanId: '',
  view: DASHBOARD_RIGHT_PANEL_VIEW.Maps,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case STAFF_GROUP_REMOVED:
      if (action.payload.id === state.groupIdFilter) {
        return { ...state, groupIdFilter: '' }
      }
      return { ...state }
    case SET_MAP_CENTER:
      return { ...state, mapCenter: action.payload }
    case FILTER_BY_GEOFENCE:
      return { ...state, geofenceIdFilter: action.payload, groupIdFilter: '' }
    case FILTER_BY_USER_GROUP:
      return { ...state, groupIdFilter: action.payload, geofenceIdFilter: '' }
    case RESET_FILTERS:
      return { ...state, geofenceIdFilter: '', groupIdFilter: '' }
    case OPEN_INCIDENT_VIEW:
      return {
        ...state,
        openedIncidentId: action.payload,
        incidentFormOpened: false,
        openedCheckId: '',
      }
    case OPEN_INCIDENT_FORM:
      return {
        ...state,
        incidentFormOpened: true,
        openedIncidentId: '',
        openedCheckId: '',
      }
    case UPDATE_INCIDENT:
      return {
        ...state,
        incidentFormOpened: true,
      }
    case UPDATE_BAN_INCIDENT:
      return {
        ...state,
        incidentFormOpened: true,
      }
    case CLOSE_SLIDING_VIEW:
      return {
        ...state,
        incidentFormOpened: false,
        openedIncidentId: '',
        openedCheckId: '',
        editBanId: '',
      }
    case OPEN_EDIT_BAN_FORM:
      return { ...state, editBanId: action.payload }
    case CHANGE_RIGHT_PANEL_VIEW:
      return { ...state, view: action.payload }
    case OPEN_EDIT_CHECK_VIEW:
      return {
        ...state,
        openedCheckId: action.payload,
        openedIncidentId: '',
        editBanId: '',
      }
    case OPEN_DIALOG:
      return {
        ...state,
        openedDialog: true,
        dialogType: action.payload.type,
        dialogKey: state.dialogKey + 1,
        dialogProps: action.payload.props,
      }
    case CLOSE_DIALOG:
    case CONFIRM_DIALOG:
      return { ...state, openedDialog: false }
    case EVENT_GEOFENCES_UPDATED:
      return { ...state, redrawGeofences: true }
    case GEOFENCES_REDRAWN:
      return { ...state, redrawGeofences: false }
    default:
      return state
  }
}

// sagas
function* sendEventNotification(eventId, message, type) {
  return yield sendPushNotification({
    id: eventId,
    message,
    type: 'event',
    extra: { notification_type: type },
  })
}

function* evacuateSiteSaga({ payload: { message } }) {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  yield sendEventNotification(eventId, message, 'evacuation')
  yield put(closeDialog())
}

function* lockdownZoneSaga({ payload: { message } }) {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  yield sendEventNotification(eventId, message, 'lockdown')
  yield put(closeDialog())
}

function* sendNotificationSaga({ payload: { message } }) {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  yield sendEventNotification(eventId, message, 'regular')
  yield put(closeDialog())
}

export function* confirmDialogSaga(title, message, buttonText) {
  yield put(openDialog(DIALOG_TYPE.Confirm, { title, message, buttonText }))

  const action = yield take([CONFIRM_DIALOG, CLOSE_DIALOG])
  if (action.type === CONFIRM_DIALOG) {
    const { payload: hasConfirmed } = action
    return hasConfirmed
  }

  return false
}

export function* commentDialogSaga(
  title,
  message,
  buttonText,
  required = false,
) {
  yield put(
    openDialog(DIALOG_TYPE.Comment, { title, message, buttonText, required }),
  )

  const action = yield take([ON_COMMENT_DIALOG, CLOSE_DIALOG])
  if (action.type === ON_COMMENT_DIALOG) {
    const { comment } = action.payload
    return { success: true, comment }
  }

  return { success: false, comment: null }
}

function* watch() {
  yield takeEvery(EVACUATE_SITE, evacuateSiteSaga)
  yield takeEvery(LOCKDOWN_ZONE, lockdownZoneSaga)
  yield takeEvery(SEND_NOTIFICATION, sendNotificationSaga)
}

// exports
export default { reducer, watch }
