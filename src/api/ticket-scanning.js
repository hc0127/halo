import * as api from './'

const TICKET_SCANNING = '/tickets/client_import_setting/'
const TICKET_EVENT = '/tickets/event/'
const TICKET_EVENT_AWS = '/events/'

export const getTicketScanningSettings = () =>
  new Promise((resolve, reject) =>
    api
      .get(TICKET_SCANNING)
      .then(res => resolve(res.data.results[0]))
      .catch(err => reject(err)),
  )

export const getTicketScanningSettingsClient = clientId =>
  new Promise((resolve, reject) =>
    api
      .get(`${TICKET_SCANNING}${clientId}/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const createTicketScanningSetting = (clientId, data) =>
  new Promise((resolve, reject) =>
    api
      .post(`${TICKET_SCANNING}save/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getTicketLogs = (eventId, pageNo) => {
  const page = pageNo ? `?page=${pageNo}` : ''
  return new Promise((resolve, reject) =>
    api
      .getAws(`${TICKET_EVENT_AWS}${eventId}/ticket_log`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}
export const getEventsAWS = (eventId) =>
  new Promise((resolve, reject) =>
    api
      .getAws(`${TICKET_EVENT_AWS}${eventId}`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getTicketImportLog = eventId =>
  new Promise((resolve, reject) =>
    api
      .get(`${TICKET_EVENT}${eventId}/import_log/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )