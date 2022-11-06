import * as api from './'

const AUTH = '/token/'

export const login = (username, password) =>
  new Promise((resolve, reject) =>
    api
      .post(AUTH, { username, password })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const refreshToken = refreshToken =>
  new Promise((resolve, reject) =>
    api
      .post(`${AUTH}refresh/`, { refresh: refreshToken })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
