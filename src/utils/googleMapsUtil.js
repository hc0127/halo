const isIncidentInGeofence = (incident, geofenceZone) => {
  if (!geofenceZone) return true
  if (!incident) return false
  if (!incident.capture_data.location) return false
  return rerender(
    incident.capture_data.location.latitude,
    incident.capture_data.location.longitude,
    geofenceZone,
  )
}

const isUserInGeofence = (user, geofenceZone) => {
  if (!geofenceZone) return true
  if (!user) return false
  if (!user.location) return false
  return rerender(user.location.latitude, user.location.longitude, geofenceZone)
}

const isLogInGeofence = (log, geofenceZone) => {
  if (!geofenceZone) return true
  if (!log) return false
  return (
    isIncidentInGeofence(log.incident, geofenceZone) ||
    isUserInGeofence(log.user, geofenceZone)
  )
}

const rerender = (lat, long, geofenceZone) => {
  const { LatLng, geometry } = window.google.maps

  return geometry.poly.containsLocation(new LatLng(lat, long), geofenceZone)
}

const getGeofenceZone = geofence => {
  if (!geofence) return null

  const { Polygon, LatLng } = window.google.maps

  const zone = new Polygon({
    paths: geofence.points.map(
      point => new LatLng(point.latitude, point.longitude),
    ),
  })

  return zone
}

export default {
  getGeofenceZone,
  isIncidentInGeofence,
  isUserInGeofence,
  isLogInGeofence,
}
