import React from 'react'
import DashboardPanel from './DashboardPanel'
import { DASHBOARD_PANEL } from '../../utils/constants'
import { Incidents, ActivityLogs } from '..'
import IncidentTriaging from '../IncidentTriaging'

const propTypes = {}

const DashboardLeftPanel = () => (
  <DashboardPanel type={DASHBOARD_PANEL.Left}>
    <div className="dashboard-page__panel-overflow">
      <IncidentTriaging />
      <Incidents />
    </div>
    <ActivityLogs />
  </DashboardPanel>
)

DashboardLeftPanel.propTypes = propTypes

DashboardLeftPanel.defaultProps = {}

export default DashboardLeftPanel
