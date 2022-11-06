import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import { Icon } from '../common'
import { getIcon } from '../../stores/IconStore'
import IncidentTypeName from '../IncidentTypeName'
import Title from '../common/Title/Title'
import ClickableDiv from '../ClickableDiv'
import DashboardPinIcon from './DashboardPinIcon'
import { openIncidentView } from '../../stores/ReduxStores/dashboard/dashboard'

const propTypes = {
  incident: PropTypes.instanceOf(Parse.Object).isRequired,
  onClick: PropTypes.func.isRequired,
  zIndex: PropTypes.number,
  dispatch: PropTypes.func,
}

const IncidentPin = ({ incident, onClick, zIndex, dispatch }) => {
  const [popupOpen, setPopupOpen] = useState(false)

  const captureData = incident.capture_data || {}
  const { location } = captureData

  if (!(captureData && location)) {
    return null
  }

  return (
    <div
      className="dashboard-pin dashboard-pin--incident"
      style={zIndex ? { zIndex, position: 'relative' } : null}
    >
      <ClickableDiv
        onClick={() => {
          onClick({ lat: location.latitude, lng: location.longitude })
          console.log('PIN INCIDENT ID', incident.id)
          dispatch(openIncidentView(incident.id))
        }}
      >
        <DashboardPinIcon type="incident">
          <Icon
            src={getIcon(incident.type_value || 'other')}
            size={25}
            margin="0 1px 4px 0"
          />
        </DashboardPinIcon>
      </ClickableDiv>
    </div>
  )
}

IncidentPin.propTypes = propTypes

IncidentPin.defaultProps = {
  zIndex: null,
  dispatch: () => {},
}

export default IncidentPin
