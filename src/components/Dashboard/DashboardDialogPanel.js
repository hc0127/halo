import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import DashboardPanel from './DashboardPanel'
import { DASHBOARD_PANEL } from '../../utils/constants'
import { closeDialog } from '../../stores/ReduxStores/dashboard/dashboard'
import Dialog from '../Dialog'

const propTypes = {
  openedDialog: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
}

const DashboardDialogPanel = ({ openedDialog, dispatch }) => (
  <DashboardPanel type={DASHBOARD_PANEL.Dialog} open={openedDialog}>
    <button
      className="dashboard__dialog-overlay"
      onClick={() => dispatch(closeDialog())}
    />
    <div className="dashboard__dialog-container">
      <Dialog />
    </div>
  </DashboardPanel>
)

DashboardDialogPanel.propTypes = propTypes

DashboardDialogPanel.defaultProps = {}

export default connect(state => ({
  openedDialog: state.dashboard.openedDialog,
}))(DashboardDialogPanel)
