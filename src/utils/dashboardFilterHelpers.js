import googleMapsUtil from './googleMapsUtil'

const isIncidentInUserGroup = (incident, userGroup) => {
  if (!userGroup) return true
  if (!incident) return false
  return userGroup.users
    .map(user => user)
    .includes(incident?.reported_by?.object_id)
}

const isUserInUserGroup = (user, userGroup) => {
  if (!userGroup) return true
  if (!user) return false
  return userGroup.users.map(user => user).includes(user.object_id)
}

const isLogsInUserGroup = (log, userGroup) => {
  if (!userGroup) return true
  if (!log) return false
  return (
    isIncidentInUserGroup(log.incident, userGroup) ||
    isUserInUserGroup(log.user, userGroup)
  )
}

const filterStaffByUserGroups = (userGroups, arrayToFilter) => {
  let userGroupUsers = []

  userGroups.forEach(group => userGroupUsers.push(...group.users))

  return arrayToFilter.filter(user => {
    return userGroupUsers.includes(user.object_id)
  })
}

const filterLogsByUserGroups = (userGroups, arrayToFilter) => {
  let userGroupUsers = []

  userGroups.forEach(group => userGroupUsers.push(...group.users))

  return arrayToFilter.filter(({ user }) => {
    return userGroupUsers.includes(user.object_id)
  })
}

const filterIncidentsByUserGroups = (userGroups, arrayToFilter) => {
  let userGroupUsers = []

  userGroups.forEach(group => userGroupUsers.push(...group.users))

  return arrayToFilter.filter(({ reported_by }) => {
    return userGroupUsers.includes(reported_by.object_id)
  })
}

const filterIncidentsByGeofenceOrUserGroup = (geofence, userGroup) => {
  const geofenceZone = googleMapsUtil.getGeofenceZone(geofence)
  return incident =>
    (geofenceZone &&
      googleMapsUtil.isIncidentInGeofence(incident, geofenceZone)) ||
    (userGroup && isIncidentInUserGroup(incident, userGroup))
}

const filterStaffByGeofenceOrUserGroup = (geofence, userGroup) => {
  const geofenceZone = googleMapsUtil.getGeofenceZone(geofence)
  return user =>
    (geofenceZone && googleMapsUtil.isUserInGeofence(user, geofenceZone)) ||
    (userGroup && isUserInUserGroup(user, userGroup))
}

const filterLogsByGeofenceOrUserGroup = (geofence, userGroup) => {
  const geofenceZone = googleMapsUtil.getGeofenceZone(geofence)
  return log =>
    (geofenceZone && googleMapsUtil.isLogInGeofence(log, geofenceZone)) ||
    (userGroup && isLogsInUserGroup(log, userGroup))
}

export default {
  filterIncidentsByGeofenceOrUserGroup,
  filterStaffByGeofenceOrUserGroup,
  filterStaffByUserGroups,
  filterLogsByUserGroups,
  filterIncidentsByUserGroups,
  filterLogsByGeofenceOrUserGroup,
}
