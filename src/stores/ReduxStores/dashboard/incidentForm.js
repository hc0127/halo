import { fork, call, put, select } from 'redux-saga/effects'

// api calls
import { getEventIncidentForms } from '../../../api/events'

// constants
export const LOAD_FORMS = 'INCIDENT_FORMS:LOAD'
export const FORMS_LOADED = 'INCIDENT_FORMS:LOADED'

// actions
const loadForms = () => ({ type: LOAD_FORMS })

// initial state
const initialState = {
  loading: false,
  dataSources: [],
  descriptions: [],
  fields: [],
  forms: [],
  incidents: [],
}

// reducer
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_FORMS:
      return { ...state, loading: true }
    case FORMS_LOADED:
      return { ...state, ...action.payload, loading: false }
    default:
      return state
  }
}

// sagas
function* loadFormsSaga() {
  const eventId = yield select(state => state.currentEvent.event.object_id)
  const forms = yield call(() => getEventIncidentForms(eventId))
  yield put({ type: FORMS_LOADED, payload: forms })
}

export function* watchForms() {
  yield fork(loadFormsSaga)
}

export default { LOAD_FORMS, FORMS_LOADED, loadForms, reducer, watchForms }
