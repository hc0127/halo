import * as api from './'

const GEOFENCES = '/events/geofence/'

export const getGeoFence = geoFenceId =>
  new Promise((resolve, reject) =>
    api
      .get(`${GEOFENCES}/${geoFenceId}/`)
      .then(res => resolve(res))
      .catch(err => reject(err)),
  )

export const getGeoFences = () =>
  new Promise((resolve, reject) =>
    api
      .get(GEOFENCES)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const createGeoFence = data =>
  new Promise((resolve, reject) =>
    api
      .post(GEOFENCES, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const updateGeoFence = data =>
  new Promise((resolve, reject) =>
    api
      .patch(`${GEOFENCES}${data.object_id}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const deleteGeoFence = geoFenceId =>
  geoFenceId !== undefined &&
  new Promise((resolve, reject) =>
    api
      .remove(`${GEOFENCES}${geoFenceId}/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
