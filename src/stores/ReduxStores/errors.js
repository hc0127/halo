// imports
import { call, takeEvery } from 'redux-saga/effects'

// constants
const LOG_ERROR = 'ERROR:LOG'

// actions
export const logError = error => ({ type: LOG_ERROR, payload: error })

// initial state
const initialState = {}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state
  }
}

function* logErrorSaga({ payload: error }) {
  yield call(() => {
    console.log(
      'THERE WAS AN ERROR, IT HAS BEEN CAPTURED AND DISPLAYED HERE',
      error,
    )
    // TODO: LOG THIS ERROR SOMEWHERE IN THE BACKEND
  })
}

// sagas
function* watch() {
  yield takeEvery(LOG_ERROR, logErrorSaga)
}

// exports
export default { reducer, watch }
