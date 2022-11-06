// imports
import { call, put, takeLatest } from 'redux-saga/effects'

// api calls
import { getIncidentsViewed } from '../../../api/incidents'

// constants
const LOAD_USER_VIEWS = 'USER_VIEWS:LOAD'
const USER_VIEWS_LOADED = 'USER_VIEWS:LOADED'

// actions
export const loadUserViews = incidentId => ({
  type: LOAD_USER_VIEWS,
  payload: { incidentId },
})

// initial state
const initialState = {
  listByIncidentId: {},
  status: 'loading',
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_USER_VIEWS:
      return { ...state, status: 'loading' }
    case USER_VIEWS_LOADED:
      return {
        ...state,
        status: 'loaded',
        listByIncidentId: {
          ...state.listByIncidentId,
          [action.payload.incidentId]: action.payload.userViews,
        },
      }
    default:
      return state
  }
}

function* loadUserViewsSaga({ payload: { incidentId } }) {
  const userViews = yield call(() => getIncidentsViewed(incidentId))

  yield put({ type: USER_VIEWS_LOADED, payload: { incidentId, userViews } })
}

// sagas
function* watch() {
  yield takeLatest(LOAD_USER_VIEWS, loadUserViewsSaga)
}

// selectors
export const getUserViews = (state, incidentId) => {
  if (!incidentId) return []
  const userViews = state.userViews.listByIncidentId[incidentId]
  if (!userViews) return []
  return userViews
}

export const getLoading = state => state.userViews.status === 'loading'

// exports
export default { reducer, watch }
