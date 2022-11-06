import * as api from './'

const GROUPS = '/users/group/'

export const getGroups = () =>
  new Promise((resolve, reject) =>
    api
      .get(GROUPS)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const createGroup = data =>
  new Promise((resolve, reject) =>
    api
      .post(GROUPS, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const updateGroup = data =>
  new Promise((resolve, reject) =>
    api
      .patch(`${GROUPS}${data.groupId}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const deleteGroups = groupIds =>
  new Promise((resolve, reject) =>
    api
      .post(`${GROUPS}batch-delete/`, { object_ids: groupIds })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const getStaffGroups = clientId =>
  new Promise((resolve, reject) =>
    api
      .get(`${GROUPS}?client__object_id=${clientId}`)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )
