import * as api from './'

const EVENTS = '/events/event/'
const EVENT_CHECK = '/events/event-check/'
const EVENT_BANS = '/events/banned/'
const CAPACITY_HISTORY = '/events/capacity-history/'

export const getEvent = eventId =>
  new Promise((resolve, reject) =>
    api
      .get(`${EVENTS}${eventId}/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getEvents = () =>
  new Promise((resolve, reject) =>
    api
      .get(EVENTS)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const createEvent = data =>
  new Promise((resolve, reject) =>
    api
      .post(EVENTS, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const updateEvent = data =>
  new Promise((resolve, reject) =>
    api
      .patch(`${EVENTS}${data.eventId}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const closeEvent = eventId =>
  new Promise((resolve, reject) =>
    api
      .post(`${EVENTS}close_event/`, { object_id: eventId })
      .then(res => resolve(res))
      .catch(err => reject(err)),
  )

export const deleteEvents = eventIds =>
  new Promise((resolve, reject) =>
    api
      .post(`${EVENTS}batch-delete/`, { object_ids: eventIds })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getEventGeoFences = eventId =>
  new Promise((resolve, reject) =>
    api
      .get(`${EVENTS}${eventId}/geofence/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const getEventHaloChecks = (eventId, nextPage, searchTerm = '') =>
  new Promise((resolve, reject) =>
    api
      .get(
        `${EVENTS}${eventId}/admin-check/?page_size=${20}&page=${nextPage}&search=${searchTerm}`,
      )
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getEventGeofences = eventId =>
  new Promise((resolve, reject) =>
    api
      .get(`${EVENTS}${eventId}/geofence/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const getEventIncidentForms = eventId => {
  return new Promise((resolve, reject) =>
    api
      .get(`${EVENTS}${eventId}/incident-forms/?medium=dashboard`)
      .then(res => resolve(res.data.result))
      .catch(err => reject(err)),
  )
}

export const getEventStaff = eventId => {
  return new Promise((resolve, reject) =>
    api
      .get(`${EVENTS}${eventId}/staff/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )
}

export const updateCapacityCounter = (eventId, value) => {
  return new Promise((resolve, reject) =>
    api
      .post(`${EVENTS}${eventId}/capacity-update/`, { value })
      .then(res => resolve(res.data.result))
      .catch(err => reject(err)),
  )
}

export const duplicateEvent = (eventId, data) => {
  return new Promise((resolve, reject) =>
    api
      .post(`${EVENTS}${eventId}/duplicate/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const getEventChecks = (
  eventId,
  pageNo,
  pageSize,
  searchTerm = '',
  eventType = '',
  statuses = '',
) => {
  const type = eventType && `admin_check__event_type=${eventType}&`
  const status = statuses && `status=${statuses}`
  return new Promise((resolve, reject) =>
    api
      .get(
        `${EVENTS}${eventId}/event-check/?page_size=${pageSize}&page=${pageNo}&search=${searchTerm}&${type}${status}`,
      )
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const getEventCheckStatusCounts = (
  eventId,
  searchTerm = '',
  eventType = '',
) => {
  const type = eventType && `admin_check__event_type=${eventType}`
  const search = searchTerm && `search=${searchTerm}&`
  return new Promise((resolve, reject) =>
    api
      .get(`${EVENTS}${eventId}/event-check/count/?${search}${type}`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const getEventBans = eventId => {
  return new Promise((resolve, reject) =>
    api
      .get(`${EVENTS}${eventId}/banned/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )
}

export const exportPDF = eventId => {
  return new Promise((resolve, reject) =>
    api
      .get(`${EVENTS}${eventId}/event-check/export/`, true)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const completeEventCheck = (eventCheckId, data) => {
  return new Promise((resolve, reject) =>
    api
      .post(`${EVENT_CHECK}${eventCheckId}/complete/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const bulkCompleteEventChecks = (eventId, checkIds, comment) => {
  return new Promise((resolve, reject) =>
    api
      .patch(`${EVENTS}${eventId}/event-check/bulk_complete/`, {
        id_list: checkIds,
        comment,
      })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const reopenEventCheck = (eventCheckId, data) => {
  return new Promise((resolve, reject) =>
    api
      .post(`${EVENT_CHECK}${eventCheckId}/reopen/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const updateEventCheckAssignees = (eventCheckId, data) => {
  return new Promise((resolve, reject) =>
    api
      .post(`${EVENT_CHECK}${eventCheckId}/update-assignees/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const getEventCheckMessages = eventCheckId => {
  return new Promise((resolve, reject) =>
    api
      .get(`${EVENT_CHECK}messages/?event_check__object_id=${eventCheckId}`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )
}

export const markEventCheckMessageAsRead = eventCheckId => {
  return new Promise((resolve, reject) =>
    api
      .post(`${EVENT_CHECK}messages/${eventCheckId}/mark-as-read/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const updateEventBan = (banId, data) => {
  return new Promise((resolve, reject) =>
    api
      .patch(`${EVENT_BANS}${banId}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const createEventCheckMessage = data => {
  return new Promise((resolve, reject) =>
    api
      .post(`${EVENT_CHECK}messages/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const deleteEventBan = banId => {
  return new Promise((resolve, reject) =>
    api
      .remove(`${EVENT_BANS}${banId}/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const getEventCapacityHistory = eventId => {
  return new Promise((resolve, reject) =>
    api
      .get(`${CAPACITY_HISTORY}?event__object_id=${eventId}/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )
}

export const getPublicReportEvents = () =>
  new Promise((resolve, reject) =>
    api
      .get(`${EVENTS}public-report/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )
