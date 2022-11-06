import * as api from './'

const CLIENTS = '/core/client/'

export const getClients = () =>
  new Promise((resolve, reject) =>
    api
      .get(CLIENTS)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const createClient = data =>
  new Promise((resolve, reject) =>
    api
      .post(CLIENTS, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const updateClient = data =>
  new Promise((resolve, reject) =>
    api
      .patch(`${CLIENTS}${data.clientId}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const deleteClient = clientId =>
  new Promise((resolve, reject) =>
    api
      .remove(`${CLIENTS}${clientId}/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const suspendClients = data =>
  new Promise((resolve, reject) =>
    api
      .post(`${CLIENTS}suspend/`, { client_ids: data })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getUsedIncidentTypes = () =>
  new Promise((resolve, reject) =>
    api
      .get(`${CLIENTS}get_used_incident_types/`)
      .then(res => resolve(res.data.result))
      .catch(err => reject(err)),
  )

export const getEventAndStaffCounts = () =>
  new Promise((resolve, reject) =>
    api
      .get(`${CLIENTS}get_event_and_staff_counts/`)
      .then(res => resolve(res.data.result))
      .catch(err => reject(err)),
  )
