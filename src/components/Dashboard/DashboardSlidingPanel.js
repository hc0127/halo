import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import DashboardPanel from './DashboardPanel'
import { DASHBOARD_PANEL } from '../../utils/constants'
import { IncidentForm } from '..'
import IncidentView from '../IncidentView'
import BanEditForm from '../BanEditForm'
import EditCheckView from '../EditCheckView/EditCheckView'

const propTypes = {
  incidentFormOpened: PropTypes.bool.isRequired,
  incidentViewOpened: PropTypes.bool.isRequired,
  banEditFormOpened: PropTypes.bool.isRequired,
  allowClosedIncident: PropTypes.bool,
  editBanId: PropTypes.string,
  editCheckViewOpened: PropTypes.bool.isRequired,
}

const DashboardSlidingPanel = ({
  incidentFormOpened,
  incidentViewOpened,
  banEditFormOpened,
  allowClosedIncident,
  editBanId,
  editCheckViewOpened,
}) => (
  <Fragment>
    <DashboardPanel type={DASHBOARD_PANEL.Sliding} open={incidentViewOpened}>
      <IncidentView allowClosedIncident={allowClosedIncident} />
    </DashboardPanel>
    <DashboardPanel type={DASHBOARD_PANEL.Sliding} open={incidentFormOpened}>
      <IncidentForm key={incidentFormOpened} />
    </DashboardPanel>
    <DashboardPanel type={DASHBOARD_PANEL.Sliding} open={banEditFormOpened}>
      <BanEditForm key={editBanId} />
    </DashboardPanel>
    <DashboardPanel type={DASHBOARD_PANEL.Sliding} open={editCheckViewOpened}>
      <EditCheckView />
    </DashboardPanel>
  </Fragment>
)

DashboardSlidingPanel.propTypes = propTypes

DashboardSlidingPanel.defaultProps = {
  allowClosedIncident: true,
  editBanId: null,
}

export default connect(state => ({
  incidentFormOpened: state.dashboard.incidentFormOpened,
  incidentViewOpened: !!state.dashboard.openedIncidentId,
  banEditFormOpened: !!state.dashboard.editBanId,
  editBanId: state.dashboard.editBanId,
  editCheckViewOpened: !!state.dashboard.openedCheckId,
}))(DashboardSlidingPanel)
