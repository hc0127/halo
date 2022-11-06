import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  DashboardLeftPanel,
  DashboardRightPanel,
  DashboardSlidingPanel,
  DashboardDialogPanel,
} from '../../components/Dashboard'
import {
  cacheEventId,
  reloadEvent,
} from '../../stores/ReduxStores/dashboard/currentEvent'
import { useInterval } from '../../utils/customHooks'
import AdminNotifications from '../../components/common/Admin/AdminNotifications'
import PrintIncidentPDF from './PrintIncidentPDF'

const DashboardPage = ({ dispatch, match }) => {
  // // load everything
  useEffect(() => {
    dispatch(cacheEventId(match.params.id))
  }, [dispatch, match.params.id])

  // // reload event every 5 ms for capacity counter
  useInterval(() => {
    dispatch(reloadEvent(match.params.id))
  }, 5000)

  return (
    <div className="dashboard-page">
      <PrintIncidentPDF />
      <DashboardLeftPanel />
      <DashboardRightPanel />
      <DashboardSlidingPanel />
      <DashboardDialogPanel />
      <AdminNotifications />
    </div>
  )
}

DashboardPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({ id: PropTypes.string }),
  }).isRequired,
}

export default connect(() => ({}))(DashboardPage)
