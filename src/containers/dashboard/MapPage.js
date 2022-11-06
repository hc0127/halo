import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
//
import { View, Panel } from '../../components/common'
import {
  DashboardSlidingPanel,
  DashboardDialogPanel,
} from '../../components/Dashboard'
import { cacheEventId } from '../../stores/ReduxStores/dashboard/currentEvent'
import { loadIncidents } from '../../stores/ReduxStores/dashboard/incidents'
import MapContainer from '../../components/MapContainer'
import { loadStaff } from '../../stores/ReduxStores/dashboard/staff'
import { loadEventGeofences } from '../../stores/ReduxStores/dashboard/eventGeofences'
import { MAP_TYPES } from '../../utils/constants'
import StaffList from '../../components/StaffList'

class MapPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({ id: PropTypes.string.isRequired }),
    }).isRequired,
  }

  static defaultProps = {}

  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    this.props.dispatch(cacheEventId(this.props.match.params.id))
    this.props.dispatch(loadIncidents())
    this.props.dispatch(loadStaff())
    this.props.dispatch(loadEventGeofences())
  }

  render() {
    return (
      <View>
        <DashboardSlidingPanel allowClosedIncident />
        <DashboardDialogPanel />
        <Panel size={1} height="100%">
          <StaffList onMapPage />
        </Panel>
        <Panel size={3} height="100%">
          <MapContainer type={MAP_TYPES.Dashboard} showPanelSelector={false} />
        </Panel>
      </View>
    )
  }
}

export default connect()(MapPage)
