import * as api from './'

const INCIDENT_EVENT = '/incidents/event/'
const INCIDENT = '/incidents/incident/'

export const getEventIncidents = eventId =>
  new Promise((resolve, reject) =>
    api
      .get(`${INCIDENT_EVENT}${eventId}/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const createIncident = (eventId, data) =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT_EVENT}${eventId}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const updateIncident = (incidentId, data) =>
  new Promise((resolve, reject) =>
    api
      .patch(`${INCIDENT_EVENT}${incidentId}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getClosedIncidents = eventId =>
  new Promise((resolve, reject) =>
    api
      .get(`${INCIDENT_EVENT}${eventId}/closed/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const getClosedIncidentsCount = eventId =>
  new Promise((resolve, reject) =>
    api
      .get(`${INCIDENT_EVENT}${eventId}/closed-count/`)
      .then(res => resolve(res.data.result))
      .catch(err => reject(err)),
  )

export const getIncidentMessagesForEvent = eventId =>
  new Promise((resolve, reject) =>
    api
      .get(`${INCIDENT_EVENT}${eventId}/incident-message/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const getIncidentMessages = incidentId =>
  new Promise((resolve, reject) =>
    api
      .get(`${INCIDENT}${incidentId}/incident-message/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const getIncidentsViewed = incidentId =>
  new Promise((resolve, reject) =>
    api
      .get(`${INCIDENT}${incidentId}/views/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const createIncidentMessage = (incidentId, data) =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT}${incidentId}/incident-message/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const resolveIncident = (incidentId, data) =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT}${incidentId}/resolve/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const unresolveIncident = incidentId =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT}${incidentId}/unresolve/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const closeIncident = (incidentId, data) =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT}${incidentId}/close/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const shareIncident = (incidentId, data) =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT}${incidentId}/triage/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const updateIncidentTags = (incidentId, data) =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT}${incidentId}/update-tags/`, data)
      .then(res => resolve(res.data.result))
      .catch(err => reject(err)),
  )

export const markIncidentAsRead = incidentId =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT}${incidentId}/mark-as-read/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const markIncidentMessagesAsRead = incidentId =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT}${incidentId}/mark-messages-as-read/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const reopenIncident = incidentId =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT}${incidentId}/reopen/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const reportClientIncident = data =>
  new Promise((resolve, reject) =>
    api
      .post(`${INCIDENT}client/${data.eventId}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
