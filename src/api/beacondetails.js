import axios from 'axios'
import { BEACONS_SERVER } from '../settings'

const BEACONS = '/beacon/'

const tempAPI = axios.create({
  baseURL: BEACONS_SERVER.env,
  headers: { 'x-api-key': 'J35HhThA48QBDibyZwkQc' },
})

export const createBeaconDetails = data => {
  return new Promise((resolve, reject) =>
    tempAPI
      .post(`${BEACONS}create`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const getBeaconDetails = () => {
  return new Promise((resolve, reject) =>
    tempAPI
      .get(BEACONS)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const updateBeacon = data =>
  new Promise((resolve, reject) =>
    tempAPI
      .put(`${BEACONS}${data.beacon_id}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getBeaconById = beacon_id =>
  new Promise((resolve, reject) =>
    tempAPI
      .get(`${BEACONS}${beacon_id}/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const deleteBeacon = beacon_id =>
  new Promise((resolve, reject) =>
    tempAPI
      .delete(`${BEACONS}${beacon_id}/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
