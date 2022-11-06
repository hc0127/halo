import * as api from './'

const USER = '/users/user/'

export const getUsers = (
  pageNo = 1,
  clientId = '',
  searchTerm = '',
  pageSize = '',
) => {
  return new Promise((resolve, reject) =>
    api
      .get(
        `${USER}?page_size=${pageSize}&page=${pageNo}&client__object_id=${clientId}&search=${searchTerm}`,
      )
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const getUser = userId => {
  return new Promise((resolve, reject) =>
    api
      .get(`${USER}${userId}/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}

export const getStaff = clientId => {
  return new Promise((resolve, reject) =>
    api
      .get(
        `${USER}?include_admins=${true}&client__object_id=${clientId}&exclude_suspended=${true}`,
      )
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )
}

export const getCurrentUser = () =>
  new Promise((resolve, reject) =>
    api
      .get(`${USER}current/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const createUser = data =>
  new Promise((resolve, reject) =>
    api
      .post(USER, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const updateUser = data =>
  new Promise((resolve, reject) =>
    api
      .patch(`${USER}${data.userId}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const suspendUsers = userIds =>
  new Promise((resolve, reject) =>
    api
      .post(`${USER}suspend/`, { object_ids: userIds })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const deleteUsers = userIds =>
  new Promise((resolve, reject) =>
    api
      .remove(`${USER}delete/`, { object_ids: userIds })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const checkUsername = username =>
  new Promise((resolve, reject) =>
    api
      .post(`${USER}check-username/`, { username })
      .then(res => resolve(res.data.result))
      .catch(err => reject(err)),
  )

export const checkEmail = email =>
  new Promise((resolve, reject) =>
    api
      .post(`${USER}check-email/`, { email })
      .then(res => resolve(res.data.result))
      .catch(err => reject(err)),
  )

export const getUserEvents = () =>
  new Promise((resolve, reject) =>
    api
      .get(`${USER}events/`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const updatePassword = (userId, password) =>
  new Promise((resolve, reject) =>
    api
      .post(`${USER}${userId}/update-password/`, { password })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const sendPasswordReset = email =>
  new Promise((resolve, reject) =>
    api
      .post(`/password-reset/`, { email })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const confirmPasswordReset = (password, token) =>
  new Promise((resolve, reject) =>
    api
      .post(`/password-reset/confirm/`, { password, token })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
