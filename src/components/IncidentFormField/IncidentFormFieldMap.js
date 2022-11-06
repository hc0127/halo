import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GoogleMapReact from 'google-map-react'

import mapStyles from './../MapContainer/mapStyles'
import { MAP_GEOFENCE_STYLE, DEFAULT_CENTER } from '../../utils/constants'
import utils from '../../utils/helpers'

const propTypes = {
  id: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  geofences: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
}

const IncidentFormFieldMap = ({ handleChange, id, geofences, loading }) => (
  <div className="incident-form-field-map">
    <div className="incident-form-field-map__sub-container">
      {!loading && (
        <GoogleMapReact
          options={{
            options: { styles: mapStyles },
            mapTypeIds: ['roadmap', 'satellite', 'styled_map'],
            mapTypeControl: true,
            streetViewControl: true,
          }}
          defaultCenter={DEFAULT_CENTER}
          bootstrapURLKeys={{
            key: 'AIzaSyBnOvtYtXW2OVevBs0R47mxdXdYiEQA3Po',
          }}
          zoom={5}
          onGoogleApiLoaded={({ map, maps }) => {
            let marker

            const handleMapClick = e => {
              const markerPosition = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              }

              if (!marker) {
                marker = new maps.Marker({ map, position: markerPosition })
                marker.setZIndex(200)
              }

              marker.setPosition(markerPosition)

              handleChange(id, markerPosition)
            }

            maps.event.addListener(map, 'click', handleMapClick)

            geofences.forEach(geofence => {
              const zonePoints = geofence.points.map(
                point => new maps.LatLng(point.latitude, point.longitude),
              )
              const mapZone = new maps.Polygon({
                map,
                paths: zonePoints,
                ...MAP_GEOFENCE_STYLE,
              })

              maps.event.addListener(mapZone, 'click', handleMapClick)
            })

            const bounds = new maps.LatLngBounds()
            geofences.forEach(geofence =>
              geofence.points.forEach(point =>
                bounds.extend(new maps.LatLng(point.latitude, point.longitude)),
              ),
            )

            const mapHasBounds =
              bounds.getCenter().lat() !== 0 ||
              bounds.getCenter().lng() !== -180

            if (mapHasBounds) {
              map.fitBounds(bounds)
            }
          }}
          yesIWantToUseGoogleMapApiInternals
        />
      )}
    </div>
  </div>
)
IncidentFormFieldMap.propTypes = propTypes

IncidentFormFieldMap.defaultProps = {}

export default connect(state => {
  const { geofenceIdFilter } = state.dashboard
  const geofences = state.eventGeofences.list

  const geofence = utils.getDataById(geofences, geofenceIdFilter)

  return {
    geofences: geofenceIdFilter ? [geofence] : geofences,
    loading: state.eventGeofences.status === 'loading',
  }
})(IncidentFormFieldMap)
