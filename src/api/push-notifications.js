import * as api from './'

const NOTIFICATION = '/notifications/notification/'

export const sendPushNotification = data =>
  new Promise((resolve, reject) =>
    api
      .post(`${NOTIFICATION}send/`, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err)),
  )
