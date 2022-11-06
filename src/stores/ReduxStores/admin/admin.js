// constants
const SET_LOADING = 'ADMIN:SET_LOADING'
const OPEN_NOTIFICATION = 'ADMIN:OPEN_NOTIFICATION'
const CLOSE_NOTIFICATION = 'ADMIN:CLOSE_NOTIFICATION'
const UPDATE_FILTER_CLIENT_ID = 'ADMIN:UPDATE_FILTER_CLIENT_ID'
const UPDATE_FILTER_VALUE = 'ADMIN:UPDATE_FILTER_VALUE'
const UPDATE_FILTER_YEAR = 'ADMIN:UPDATE_FILTER_YEAR'
const UPDATE_FILTER_MONTH = 'ADMIN:UPDATE_FILTER_MONTH'

// actions
export const setLoading = (isOpen, message) => ({
  type: SET_LOADING,
  payload: { isOpen, message },
})
export const notify = message => ({
  type: OPEN_NOTIFICATION,
  payload: { message },
})
export const closeNotification = index => ({
  type: CLOSE_NOTIFICATION,
  payload: { index },
})
export const updateFilterClientId = value => ({
  type: UPDATE_FILTER_CLIENT_ID,
  payload: value,
})
export const updateFilterValue = (key, value) => ({
  type: UPDATE_FILTER_VALUE,
  payload: { key, value },
})
export const updateFilterYear = value => ({
  type: UPDATE_FILTER_YEAR,
  payload: value,
})
export const updateFilterMonth = value => ({
  type: UPDATE_FILTER_MONTH,
  payload: value,
})

// initial state
const initialState = {
  isLoading: false,
  loadingMessage: '',
  notifications: [],
  filterClientId: '',
  filterValues: {},
  filterYear: '',
  filterMonth: '',
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isOpen,
        loadingMessage: action.payload.isOpen
          ? action.payload.message
          : state.loadingMessage,
      }
    case OPEN_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { message: action.payload.message },
        ],
      }
    case CLOSE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (_, index) => index !== action.payload.index,
        ),
      }
    case UPDATE_FILTER_CLIENT_ID:
      return { ...state, filterClientId: action.payload }
    case UPDATE_FILTER_VALUE:
      return {
        ...state,
        filterValues: {
          ...state.filterValues,
          [action.payload.key]: action.payload.value,
        },
      }
    case UPDATE_FILTER_YEAR:
      return { ...state, filterYear: action.payload }
    case UPDATE_FILTER_MONTH:
      return { ...state, filterMonth: action.payload }
    default:
      return state
  }
}

// sagas
function* watch() {}

// exports
export default { reducer, watch }
