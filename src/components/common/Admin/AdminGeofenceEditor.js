import React, { Component } from 'react'
import PropTypes from 'prop-types'
import GoogleMapReact from 'google-map-react'

import mapStyles from './../../MapContainer/mapStyles'
import utils from './../../../utils/helpers'

const initMarkers = (geofencePoints, oldMarkers, self) => {
  const markers = oldMarkers.slice(0)

  for (let i = 0; i < geofencePoints.length; i++) {
    const point = geofencePoints[i]
    let marker = markers[i]

    const latLng = new self.maps.LatLng(point.latitude, point.longitude)

    if (!marker) {
      marker = new self.maps.Marker({
        map: self.map,
        latLng,
        draggable: true,
        optimized: false,
        zIndex: 100,
      })

      markers.push(marker)

      self.maps.event.addListener(marker, 'dragend', () =>
        self.handleMarkerMove(),
      )
      self.maps.event.addListener(marker, 'rightclick', () =>
        self.removeMarker(marker),
      )
    }

    marker.setPosition(latLng)
  }

  return markers
}

const markerToGeopoint = marker => ({
  latitude: marker.position.lat(),
  longitude: marker.position.lng(),
})

class AdminGeofenceEditor extends Component {
  static propTypes = {
    geofencePoints: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    self: PropTypes.object.isRequired,
  }

  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = { markers: [] }
    this.map = null
    this.maps = null
    this.geofence = null
  }

  onGoogleApiLoaded({ map, maps }) {
    this.map = map
    this.maps = maps

    const markers = initMarkers(
      this.props.geofencePoints,
      this.state.markers,
      this,
    )

    if (markers.length > 1) {
      // if we have enough markers, set the center and zoom level
      const bounds = new maps.LatLngBounds()
      markers.forEach(marker => bounds.extend(marker.position))
      map.setCenter(bounds.getCenter())
      map.fitBounds(bounds)
    }

    this.setState({ markers })
  }

  static getDerivedStateFromProps(props, state) {
    const { geofencePoints, self } = props

    if (!self || !self.map || !self.maps) {
      return null
    }

    return { markers: initMarkers(geofencePoints, state.markers, self) }
  }

  defaultZoom = 5
  defaultCenter = { lat: 55, lng: -4 }

  comparePoints(points) {
    const pointToLatLng = (maps, geopoint) =>
      new maps.LatLng(geopoint.latitude, geopoint.longitude)

    const calculateBearingFromPoint = (maps, center, point) =>
      maps.geometry
        ? maps.geometry.spherical.computeHeading(
            center,
            pointToLatLng(maps, point),
          )
        : 0

    const { maps } = this

    const latLngs = points.map(point => pointToLatLng(maps, point))

    const center = new maps.LatLng(
      utils.average(latLngs.map(point => point.lat())),
      utils.average(latLngs.map(point => point.lng())),
    )

    return (point1, point2) => {
      const bearing1 = calculateBearingFromPoint(maps, center, point1)
      const bearing2 = calculateBearingFromPoint(maps, center, point2)

      return bearing1 - bearing2
    }
  }

  handleMarkerMove() {
    this.updatePoints(this.state.markers.map(markerToGeopoint))
  }

  addMarker() {
    const { map, maps } = this
    if (!map || !maps) {
      return
    }

    let position = map.center

    const { markers } = this.state

    if (markers.length >= 2) {
      position = new maps.LatLng(
        (markers[markers.length - 1].position.lat() +
          markers[markers.length - 2].position.lat()) /
          2,
        (markers[markers.length - 1].position.lng() +
          markers[markers.length - 2].position.lng()) /
          2,
      )
    }

    const point = { latitude: position.lat(), longitude: position.lng() }

    const points = [...this.props.geofencePoints, point]
    this.updatePoints(points)
  }

  updatePoints(points) {
    points.sort(this.comparePoints(points))
    this.props.onChange(points)
  }

  removeMarker(markerToDelete) {
    markerToDelete.setMap(null)
    const markers = this.state.markers.filter(
      marker => marker !== markerToDelete,
    )

    this.updatePoints(markers.map(markerToGeopoint))
    this.setState({ markers })
  }

  redrawZone() {
    const { map, maps } = this

    if (!map || !maps) {
      return
    }

    const { markers } = this.state

    const geofencePoints = markers.map(marker => marker.position)

    let { geofence } = this

    if (!geofence) {
      geofence = new maps.Polygon({
        map,
        paths: geofencePoints,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
      })

      this.geofence = geofence
    }

    geofence.setPaths(geofencePoints)
  }

  render() {
    this.redrawZone()

    return (
      <div className="admin-geofence-editor">
        <GoogleMapReact
          options={{
            options: { styles: mapStyles },
            mapTypeIds: ['roadmap', 'satellite', 'styled_map'],
            mapTypeControl: true,
            streetViewControl: true,
          }}
          bootstrapURLKeys={{ key: 'AIzaSyBnOvtYtXW2OVevBs0R47mxdXdYiEQA3Po' }}
          defaultCenter={this.defaultCenter}
          defaultZoom={this.defaultZoom}
          onGoogleApiLoaded={api => this.onGoogleApiLoaded(api)}
          yesIWantToUseGoogleMapApiInternals
        />
      </div>
    )
  }
}

export default AdminGeofenceEditor
