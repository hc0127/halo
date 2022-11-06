import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import { compose } from 'redux'
import GoogleMapReact from 'google-map-react'

import googleMapStyles from './MapContainer/mapStyles'

import { Button, Loading } from './common'
import Icon from './Icon'
import { loadEventGeofences } from '../stores/ReduxStores/dashboard/eventGeofences'
import {
  resetGeofenceRedraw,
  setMapCenter,
} from '../stores/ReduxStores/dashboard/dashboard'
import {
  MAP_GEOFENCE_STYLE,
  MAP_TYPES,
  DEFAULT_CENTER,
  USER_PERMISSIONS,
} from '../utils/constants'
import utils from '../utils/helpers'
import dashboardUtils from '../utils/dashboardFilterHelpers'
import {
  withCustomIncidentTypesContext,
  CustomIncidentTypesContext,
} from '../Contexts'
import IncidentPin from './DashboardPin/IncidentPin'
import StaffPin from './DashboardPin/StaffPin'
import DashboardRightPanelViewSelector from './Dashboard/DashboardRightPanelViewSelector'

class MapContainer extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    geofences: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    staff: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    incidents: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    loading: PropTypes.bool.isRequired,
    customIncidentTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
    mapCenter: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
    headless: PropTypes.bool,
    showPanelSelector: PropTypes.bool,
    redrawGeofences: PropTypes.bool.isRequired,
    geofenceIdFilter: PropTypes.string,
    groupIdFilter: PropTypes.string,
    event: PropTypes.instanceOf(Parse.Object),
  }

  static defaultProps = {
    headless: false,
    showPanelSelector: true,
    mapCenter: null,
    geofenceIdFilter: '',
    groupIdFilter: '',
    event: null,
  }

  constructor(props) {
    super(props)
    this.state = {
      showStaff: true,
      showIncidents: true,
      mapCenter: props.mapCenter,
      zoom: 5,
      redraw: false,
      recenter: false,
      rezoom: false,
    }

    this.map = null
    this.maps = null
    this.drawnGeofences = {}

    this.centerMap = this.centerMap.bind(this)
    this.onGoogleApiLoaded = this.onGoogleApiLoaded.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (props.type === MAP_TYPES.Incident) {
      return null
    }

    if (state.geofenceIdFilter !== props.geofenceIdFilter) {
      return {
        geofenceIdFilter: props.geofenceIdFilter,
        redraw: true,
        rezoom: true,
      }
    }

    if (state.groupIdFilter !== props.groupIdFilter) {
      return { groupIdFilter: props.groupIdFilter, redraw: true, rezoom: true }
    }

    if (state.mapCenter !== props.mapCenter) {
      return { mapCenter: props.mapCenter, recenter: true }
    }

    if (props.redrawGeofences) {
      props.dispatch(resetGeofenceRedraw())
      return { redraw: true }
    }

    return null
  }

  componentDidMount() {
    this.props.dispatch(loadEventGeofences())
  }

  componentDidUpdate() {
    if (this.state.redraw) {
      this.redrawGeofences()
      this.setState({ redraw: false })
      return
    }

    if (this.state.rezoom) {
      this.setBestGuessCenterAndZoom()
      this.setState({ rezoom: false })
      return
    }

    if (this.state.recenter) {
      this.zoomOnRecenter()
      this.recenter()
      this.setState({ recenter: false })
    }
  }

  onGoogleApiLoaded({ map, maps }) {
    this.map = map
    this.maps = maps

    this.redrawGeofences()
    this.setBestGuessCenterAndZoom()
  }

  setBestGuessCenterAndZoom() {
    const { map, maps } = this

    if (!map || !maps) {
      console.warn(
        'debug',
        "setBestGuessCenterAndZoom stopped because there's no map/maps",
      )
      return
    }

    const { geofences, staff, incidents } = this.props
    const { geofenceIdFilter, mapCenter } = this.state

    const bounds = new maps.LatLngBounds()

    incidents.forEach(
      incident =>
        incident.capture_data &&
        incident.capture_data.location &&
        bounds.extend(
          new maps.LatLng(
            incident.capture_data.location.latitude,
            incident.capture_data.location.longitude,
          ),
        ),
    )
    staff.forEach(
      user =>
        user.location &&
        bounds.extend(
          new maps.LatLng(user.location.latitude, user.location.longitude),
        ),
    )

    geofences.forEach(
      geofence =>
        (!geofenceIdFilter || geofenceIdFilter === geofence.id) &&
        geofence.points.forEach(point =>
          bounds.extend(new maps.LatLng(point.latitude, point.longitude)),
        ),
    )

    const mapHasBounds =
      bounds.getCenter().lat() !== 0 || bounds.getCenter().lng() !== -180

    if (mapHasBounds) {
      map.fitBounds(bounds)
    }

    if (mapCenter && this.props.type === 'incident') {
      map.panTo(new maps.LatLng(mapCenter.latitude, mapCenter.longitude))
    } else if (mapHasBounds) {
      map.panTo(bounds.getCenter())
    }
  }

  getZIndexGenerator() {
    const { incidents, staff } = this.props

    const latitudes = [
      ...incidents.map(incident => incident.capture_data.location.latitude),
      ...staff.map(user => user.location.latitude),
    ]

    const sortedLatitudes = utils.sort(latitudes, latitude => latitude, 'desc')

    return latitude => sortedLatitudes.indexOf(latitude)
  }

  zoomOnRecenter = () => {
    if (this.map !== null) {
      this.map.setZoom(18)
    }
  }

  recenter() {
    const { map, maps } = this
    const { mapCenter } = this.state

    if (!map || !maps || !mapCenter) {
      console.warn(
        'debug',
        "recenter stopped because there's no map/maps/mapCenter",
      )
      return
    }

    map.panTo(new maps.LatLng(mapCenter.latitude, mapCenter.longitude))
  }

  redrawGeofences() {
    const { map, maps } = this

    if (!map || !maps) {
      console.warn('debug', "drawGeofences stopped because there's no map/maps")
      return
    }

    const { geofences } = this.props

    Object.values(this.drawnGeofences).forEach(geofence =>
      geofence.setMap(null),
    )

    geofences.forEach(geofence => {
      const zonePoints = geofence.points.map(
        point => new maps.LatLng(point.latitude, point.longitude),
      )
      if (!this.drawnGeofences[geofence.id]) {
        const mapZone = new maps.Polygon({
          map,
          paths: zonePoints,
          ...MAP_GEOFENCE_STYLE,
        })

        this.drawnGeofences[geofence.id] = mapZone
      }
      this.drawnGeofences[geofence.id].setPaths(zonePoints)
      this.drawnGeofences[geofence.id].setMap(map)
    })
  }

  centerMap({ lat, lng }) {
    this.props.dispatch(setMapCenter({ latitude: lat, longitude: lng }))
  }

  render() {
    const {
      loading,
      incidents,
      staff,
      customIncidentTypes,
      headless,
      event,
      showPanelSelector,
      dispatch,
    } = this.props
    const { zoom, showIncidents, showStaff } = this.state
    const zIndexGenerator = this.getZIndexGenerator()

    return (
      <section
        className={`map-container ${headless ? 'map-container--headless' : ''}`}
      >
        <div className="map-container__header">
          <div className="map-container__header__title">
            {showPanelSelector && <DashboardRightPanelViewSelector />}
          </div>
          <div className="map-container__header__icons">
            <Button
              type="invisible"
              margin={8}
              onClick={() =>
                this.setState({ showIncidents: !this.state.showIncidents })
              }
              className={utils.makeClass(
                'map-container__filter',
                !this.state.showIncidents && 'disabled',
              )}
            >
              <Icon type="mapIncidents" size={20} />
            </Button>
            <Button
              margin={8}
              onClick={() =>
                this.setState({ showStaff: !this.state.showStaff })
              }
              className={utils.makeClass(
                'map-container__filter',
                !this.state.showStaff && 'disabled',
              )}
            >
              <Icon type="mapStaff" size={20} />
            </Button>
          </div>
        </div>

        <div className="map-container__content">
          {loading && <Loading centered />}
          <GoogleMapReact
            key={`loaded--${loading}`}
            options={{
              options: { styles: googleMapStyles },
              mapTypeIds: ['roadmap', 'satellite', 'styled_map'],
              mapTypeControl: true,
              streetViewControl: true,
            }}
            bootstrapURLKeys={{
              key: 'AIzaSyBnOvtYtXW2OVevBs0R47mxdXdYiEQA3Po',
            }}
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={zoom}
            onGoogleApiLoaded={api => this.onGoogleApiLoaded(api)}
            yesIWantToUseGoogleMapApiInternals
          >
            {showIncidents &&
              incidents.map(incident => {
                const { location } = incident.capture_data

                return (
                  // We have to provide this context again
                  // because the map children live in a different tree than our app's tree
                  // (this is how the library works)
                  <CustomIncidentTypesContext.Provider
                    key={`incident:${incident.id}`}
                    lat={location.latitude}
                    lng={location.longitude}
                    value={customIncidentTypes}
                  >
                    <IncidentPin
                      incident={incident}
                      onClick={this.centerMap}
                      zIndex={zIndexGenerator(location.latitude)}
                      dispatch={dispatch}
                    />
                  </CustomIncidentTypesContext.Provider>
                )
              })}
            {showStaff &&
              staff.map(user => {
                const location = user.location
                return (
                  <StaffPin
                    key={`staff:${user.object_id}`}
                    lat={location.latitude}
                    lng={location.longitude}
                    user={user}
                    onClick={this.centerMap}
                    zIndex={zIndexGenerator(location.latitude)}
                    event={event}
                  />
                )
              })}
          </GoogleMapReact>
        </div>
      </section>
    )
  }
}

export default compose(
  withCustomIncidentTypesContext,
  connect((state, props) => {
    const {
      auth: { currentUser },
    } = state
    const { event } = state.currentEvent
    const { geofenceIdFilter, groupIdFilter } = state.dashboard

    const geofences = state.eventGeofences.list
    const { redrawGeofences } = state.dashboard

    const geofence = utils.getDataById(geofences, geofenceIdFilter)

    const staffGroups = state.staffGroups.list

    const staffGroup = staffGroups.find(
      ({ object_id }) => object_id === groupIdFilter,
    )

    let staff = []
    let incidents = []
    let mapCenter = {}
    let loading = false

    if (props.type === 'dashboard') {
      const isTriagingEnabled = utils.hasIncidentTriaging(
        state.currentEvent.event,
      )

      const staffArr = Object.values(state.staff.data)
        .filter(user => utils.isBookedOn(user, state.currentEvent.event))
        .filter(user => user.location)

      staff =
        geofence || staffGroup
          ? Object.values(state.staff.data)
              .filter(user => utils.isBookedOn(user, state.currentEvent.event))
              .filter(dashboardUtils.filterStaffByGeofenceOrUserGroup(geofence))
              .filter(user => user.location)
          : staffArr

      const triagedIncidents = Object.values(
        state.incidents.data,
      ).filter(incident => (isTriagingEnabled ? incident.triaged : true))

      incidents =
        geofence || staffGroup
          ? triagedIncidents.filter(
              dashboardUtils.filterIncidentsByGeofenceOrUserGroup(
                geofence,
                staffGroup,
              ),
            )
          : currentUser.permission_role ===
            USER_PERMISSIONS.TargetedDashboardUser
          ? dashboardUtils.filterIncidentsByUserGroups(
              staffGroups,
              triagedIncidents,
            )
          : triagedIncidents
      ;({ mapCenter } = state.dashboard)

      loading =
        state.incidents.status === 'loading' ||
        state.staff.status === 'loading' ||
        state.eventGeofences.status === 'loading'
    } else if (props.type === 'incident') {
      staff = []
      let incident = state.incidents.data[props.incidentId]

      if (!incident) {
        incident = state.incidents.closedIncidentList.filter(
          incident => incident.id === props.incidentId,
        )[0]
      }

      incidents = incident ? [incident] : []

      mapCenter = incident.capture_data.location

      loading = !incident
    }

    incidents = incidents.filter(
      incident => incident.capture_data && incident.capture_data.location,
    )

    const filteredMal = dashboardUtils
      .filterStaffByUserGroups(staffGroups, Object.values(state.staff.data))
      .filter(user => user.location)
      .map(staff => ({
        ...staff,
        location: {
          longitude: staff.location.coordinates[0],
          latitude: staff.location.coordinates[1],
        },
      }))

    return {
      incidents,
      staff:
        currentUser.permission_role === USER_PERMISSIONS.TargetedDashboardUser
          ? filteredMal
          : staff.map(staff => ({
              ...staff,
              location: {
                longitude: staff.location.coordinates[0],
                latitude: staff.location.coordinates[1],
              },
            })),
      geofences: geofenceIdFilter ? [geofence] : geofences,
      geofenceIdFilter,
      groupIdFilter,
      mapCenter,
      loading,
      redrawGeofences,
      event,
    }
  }),
)(MapContainer)
