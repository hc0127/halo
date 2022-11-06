import axios from 'axios'

import {
  NEW_SERVER as SERVER,
  TKT_RPT_SCAN_SERVER,
  APIV2_SERVER,
} from '../settings'

import { isExpired } from 'react-jwt'

import { refreshToken } from './auth'

import { reportIncidentUrl } from '../utils/constants'

let authTokenRequest

console.log(SERVER, TKT_RPT_SCAN_SERVER, APIV2_SERVER)

// This function makes a call to get the auth token
// or it returns the same promise as an in-progress call to get the auth token
async function getAuthToken() {
  if (!authTokenRequest) {
    const refresh = localStorage.getItem('refreshToken')
    authTokenRequest = refreshToken(refresh)
    authTokenRequest.then(resetAuthTokenRequest, resetAuthTokenRequest)
  }

  return authTokenRequest
}

function resetAuthTokenRequest() {
  authTokenRequest = null
}

const getReportedIncidentUrl = eventType =>
  `${reportIncidentUrl}/${eventType}/${window.location.pathname.split('/')[3]}`

axios.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // alert('We are facing Network issues.Please come back again');
      return null
    }
    if ([502].includes(error.response.status)) {
      return Promise.reject(error)
    }
    if (
      error.response.status === 401 &&
      error.response.config &&
      !error.response.config.__isRetryRequest &&
      window.location.pathname !== getReportedIncidentUrl('stadium') &&
      window.location.pathname !== getReportedIncidentUrl('festival') &&
      window.location.pathname !== getReportedIncidentUrl('arfestival') &&
      window.location.pathname !== getReportedIncidentUrl('glastonbury')
    ) {
      if (isExpired(localStorage.getItem('refreshToken'))) {
        localStorage.clear()
        window.location = '/login'
      } else {
        return getAuthToken().then(response => {
          localStorage.setItem('accessToken', response.access)
          error.response.config.__isRetryRequest = true
          return axios(error.response.config)
        })
      }
    }
    if ([400, 403, 404, 500].includes(error.response.status)) {
      return Promise.reject(error)
    }
    return error
  },
)

axios.interceptors.request.use(function(config) {
  if (
    window.location.pathname !== getReportedIncidentUrl('stadium') &&
    window.location.pathname !== getReportedIncidentUrl('festival') &&
    window.location.pathname !== getReportedIncidentUrl('arfestival') &&
    window.location.pathname !== getReportedIncidentUrl('glastonbury')
  ) {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  } else {
    config.headers = { Uuid: localStorage.getItem('uuid') }
  }

  return config
})

export const get = async (endpoint, isCSV = false) => {
  return axios({
    url: SERVER.env + endpoint,
    method: 'get',
    responseType: isCSV ? 'arraybuffer' : null,
  })
    .then(response => response)
    .catch(error => Promise.reject(error.response))
}
export const getAws = async (endpoint, isCSV = false) => {
  return axios({
    url: TKT_RPT_SCAN_SERVER.env + endpoint,
    method: 'get',
  })
    .then(response => response)
    .catch(error => Promise.reject(error.response))
}
export const post = async (endpoint, data) => {
  return axios({
    url: SERVER.env + endpoint,
    method: 'post',
    responseType: 'json',
    data,
  })
    .then(response => response)
    .catch(error => Promise.reject(error.response))
}

export const patch = async (endpoint, data) =>
  axios({
    url: SERVER.env + endpoint,
    method: 'patch',
    responseType: 'json',
    data,
  })
    .then(response => response)
    .catch(error => Promise.reject(error.response))

export const remove = async (endpoint, data) =>
  axios({
    url: SERVER.env + endpoint,
    method: 'delete',
    responseType: 'json',
    data,
  })
    .then(response => response)
    .catch(error => Promise.reject(error.response))
