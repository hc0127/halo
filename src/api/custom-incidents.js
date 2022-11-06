import * as api from '.'

const INCIDENTS = '/incidents/custom-type/'

export const createCustomIncident = data =>
  new Promise((resolve, reject) =>
    api
      .post(INCIDENTS, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getCustomIncidents = () =>
  new Promise((resolve, reject) =>
    api
      .get(INCIDENTS)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const updateCustomIncident = data =>
  new Promise((resolve, reject) =>
    api
      .patch(`${INCIDENTS}${data.incidentTypeId}/`, {
        name: data.incidentTypeName,
      })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const deleteCustomIncident = incidentTypeId =>
  new Promise((resolve, reject) =>
    api
      .remove(`${INCIDENTS}${incidentTypeId}/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
