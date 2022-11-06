import React from 'react'
import PropTypes from 'prop-types'
import DashboardPanel from './DashboardPanel'
import {
  DASHBOARD_PANEL,
  DASHBOARD_RIGHT_PANEL_VIEW,
  MAP_TYPES,
} from '../../utils/constants'
import { connect } from 'react-redux'
import MapContainer from '../MapContainer'
import StaffList from '../StaffList'
import DashboardCheckList from '../DashboardCheckList/DashboardCheckList'

const propTypes = {
  view: PropTypes.oneOf(Object.values(DASHBOARD_RIGHT_PANEL_VIEW)).isRequired,
}

const DashboardRightPanel = ({ view }) => (
  <DashboardPanel type={DASHBOARD_PANEL.Right}>
    {view === DASHBOARD_RIGHT_PANEL_VIEW.Maps ? (
      <MapContainer type={MAP_TYPES.Dashboard} />
    ) : null}
    {view === DASHBOARD_RIGHT_PANEL_VIEW.Checklist ? (
      <DashboardCheckList />
    ) : null}

    <StaffList />
  </DashboardPanel>
)

DashboardRightPanel.propTypes = propTypes

DashboardRightPanel.defaultProps = {}

export default connect(state => ({ view: state.dashboard.view }))(
  DashboardRightPanel,
)
