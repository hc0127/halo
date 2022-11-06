import { call, put, take, fork } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { serverTimeLoaded } from './ReduxStores/dashboard/serverTime'

const loadPage = (query, allValues, pageLength, pageNumber) => values => {
  allValues.push(...values)

  if (values.length === pageLength) {
    return query
      .skip(pageLength * pageNumber)
      .find()
      .then(loadPage(query, allValues, pageLength, pageNumber + 1))
  }

  return null
}

const loadAll = query => {
  const allValues = []

  const pageLength = 1000

  query.limit(pageLength)

  return query
    .find()
    .then(loadPage(query, allValues, pageLength, 1))
    .then(() => allValues)
}

// we have to load the item again because subscription can't handle included pointers
// it's a failing of the parse server library, so nothing we can fix.
const updateObjectFromLiveQuery = (
  emitter,
  updateActionType,
  query,
  payload,
) => {
  if (payload.updatedAt) {
    emitter(serverTimeLoaded(payload.updatedAt))
  }

  emitter({ type: updateActionType, payload })
}

const deleteObjectFromLiveQuery = (
  emitter,
  deleteActionType,
  query,
  payload,
) => {
  emitter({ type: deleteActionType, payload })
}

const initLiveQueryChannel = (query, updateActionType, removeActionType) =>
  eventChannel(emitter => {
    let _subscription

    query.subscribe().then(subscription => {
      _subscription = subscription
      subscription.on('create', payload =>
        updateObjectFromLiveQuery(emitter, updateActionType, query, payload),
      )
      subscription.on('enter', payload =>
        updateObjectFromLiveQuery(emitter, updateActionType, query, payload),
      )
      subscription.on('update', payload =>
        updateObjectFromLiveQuery(emitter, updateActionType, query, payload),
      )
      subscription.on('leave', payload =>
        deleteObjectFromLiveQuery(emitter, removeActionType, query, payload),
      )
      subscription.on('delete', payload =>
        deleteObjectFromLiveQuery(emitter, removeActionType, query, payload),
      )
    })

    return () => {
      _subscription.unsubscribe()
    }
  })

function* subscribe(query, updateActionType, removeActionType) {
  const channel = yield call(
    initLiveQueryChannel,
    query,
    updateActionType,
    removeActionType,
  )
  try {
    while (true) {
      const action = yield take(channel)
      yield put(action)
    }
  } catch (error) {
    console.error('subscribed query terminated', error)
  }
}

// Take only the first action ever of the given pattern
// this is because we don't want to reload data all the time because we already have LiveQuery for that
const takeOnce = (pattern, saga, ...args) =>
  fork(function*() {
    const action = yield take(pattern)
    yield call(saga, ...args.concat(action))
  })

export default { loadAll, subscribe, takeOnce }
