import * as api from '.'

const ADMIN_CHECKS = '/events/admin-check/'

export const getAdminCheck = adminCheckId =>
  new Promise((resolve, reject) =>
    api
      .get(`${ADMIN_CHECKS}/${adminCheckId}/`)
      .then(res => resolve(res))
      .catch(err => reject(err)),
  )

export const getAdminChecks = () =>
  new Promise((resolve, reject) =>
    api
      .get(ADMIN_CHECKS)
      .then(res => resolve(res.data.results))
      .catch(err => reject(err)),
  )

export const bulkUpdateHaloChecks = data =>
  new Promise((resolve, reject) =>
    api
      .patch(`${ADMIN_CHECKS}bulk_update/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const createAdminCheck = data =>
  new Promise((resolve, reject) =>
    api
      .post(ADMIN_CHECKS, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err.data)),
  )

export const updateAdminCheck = data =>
  new Promise((resolve, reject) =>
    api
      .patch(`${ADMIN_CHECKS}${data.adminCheckId}/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const deleteAdminCheck = adminCheckId =>
  new Promise((resolve, reject) =>
    api
      .remove(`${ADMIN_CHECKS}${adminCheckId}/`)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )

export const bulkUpdateAdminChecks = data =>
  new Promise((resolve, reject) =>
    api
      .patch(`${ADMIN_CHECKS}/${data.adminCheckId}/`, data)
      .then(res => resolve(res))
      .catch(err => reject(err)),
  )

export const getAdminChecksCapacityHisatory = () =>
  new Promise((resolve, reject) =>
    api
      .get(`${ADMIN_CHECKS}/capacity-history/`)
      .then(res => resolve(res))
      .catch(err => reject(err)),
  )

export const importCSV = data => {
  return new Promise((resolve, reject) =>
    api
      .post(`${ADMIN_CHECKS}${data.eventId}/import-csv/`, {
        csv_file: data.file,
      })
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
}
