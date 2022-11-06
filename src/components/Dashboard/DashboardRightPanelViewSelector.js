import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { changeRightPanelView } from '../../stores/ReduxStores/dashboard/dashboard'
import {
  DASHBOARD_RIGHT_PANEL_FEATURES,
  DASHBOARD_RIGHT_PANEL_VIEW,
} from '../../utils/constants'
import utils from '../../utils/helpers'

const DashboardRightPanelViewSelector = ({ dispatch, view, event }) => {
  const onViewChange = event => {
    const value = event.target.value
    dispatch(changeRightPanelView(value))
  }

  if (!event) {
    return null
  }

  return (
    <div className="dashboard-right-panel-view-selector">
      <div className="selector">
        <select value={view} onChange={onViewChange}> {/* eslint-disable-line */}
          {Object.values(DASHBOARD_RIGHT_PANEL_VIEW)
            .filter(key => {
              return DASHBOARD_RIGHT_PANEL_FEATURES[key].every(() =>
                utils.hasHaloChecks(event.client),
              )
            })
            .map(key => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
        </select>
      </div>
    </div>
  )
}

DashboardRightPanelViewSelector.propTypes = {
  view: PropTypes.string.isRequired,
  event: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
}

export default connect(state => ({
  view: state.dashboard.view,
  event: state.currentEvent.event,
}))(DashboardRightPanelViewSelector)
