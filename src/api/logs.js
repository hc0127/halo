import * as api from './'

const LOGS = '/core/logs/'

export const getLogs = (eventId, pageNo) =>
  new Promise((resolve, reject) =>
    api
      .get(`${LOGS}${eventId}/?page_size=${20}&page=${pageNo || 1}`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getAllLogs = eventId =>
  new Promise((resolve, reject) =>
    api
      .get(`${LOGS}${eventId}/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const createLog = (eventId, data) =>
  new Promise((resolve, reject) =>
    api
      .post(`${LOGS}add_dashboard_entry/${eventId}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
