import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  loadIncidents,
  loadClosedIncidents,
} from '../../stores/ReduxStores/dashboard/incidents'
import {
  DashboardSlidingPanel,
  DashboardDialogPanel,
} from '../../components/Dashboard'

import AnalyticsFilters from '../../components/Analytics/AnalyticsFilters'
import AnalyticsList from '../../components/Analytics/AnalyticsList'
import { cacheEventId } from '../../stores/ReduxStores/dashboard/currentEvent'
import { loadStaffGroups } from '../../stores/ReduxStores/dashboard/staffGroups'
import { loadEventGeofences } from '../../stores/ReduxStores/dashboard/eventGeofences'
import { loadStaff } from '../../stores/ReduxStores/dashboard/staff'
import BlockAnalyticsUI from '../../components/common/BlockAnalyticsUI/BlockAnalyticsUI'

class AnalyticsPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({ id: PropTypes.string }),
    }).isRequired,
  }

  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      types: [],
      staffGroupIds: [],
      geofenceIds: [],
      startDate: null,
      endDate: null,
      incidentStatuses: [],
      tags: [],
      searchTerm: '',
      users: [],
    }
  }

  componentDidMount() {
    const { dispatch, match } = this.props
    dispatch(cacheEventId(match.params.id))
    dispatch(loadIncidents())
    dispatch(loadClosedIncidents())
    dispatch(loadStaffGroups())
    dispatch(loadEventGeofences())
    dispatch(loadStaff())
  }

  render() {
    return (
      <div className="analytics-page">
        <BlockAnalyticsUI zIndex={9} opacity={0.5} color="#ababab" />
        <AnalyticsFilters
          {...this.state}
          onChange={(type, value) => {
            this.setState({ [type]: value })
          }}
        />
        <AnalyticsList
          {...this.state}
          onFilterRemove={(type, valueToRemove) => {
            this.setState({
              [type]: this.state[type].filter(value => value !== valueToRemove),
            })
          }}
        />
        <DashboardSlidingPanel allowClosedIncident />
        <DashboardDialogPanel />
      </div>
    )
  }
}

export default connect()(AnalyticsPage)
