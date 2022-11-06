import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import { compose } from 'redux'

import { ProgressRing, EditableField } from '../common'
import { setCapacityCounter } from '../../stores/ReduxStores/dashboard/currentEvent'
import { CLIENT_FEATURES, USER_PERMISSIONS } from '../../utils/constants'
import utils from '../../utils/helpers'
import { withUserContext } from '../../Contexts'

const propTypes = {
  event: PropTypes.instanceOf(Parse.Object),
  ticketScanning: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  loading: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
  variant: PropTypes.oneOf(['dashboard', 'ticket-scanning']),
}

const CapacityView = ({ event, loading, dispatch, variant, currentUser,ticketScanning }) => {
  let capacityTotal = 0
  let capacityCounter = 0

  let editable = true

  if (
    utils.hasFeature(event, CLIENT_FEATURES.TicketScanning) &&
    !utils.hasPermission(currentUser, [
      USER_PERMISSIONS.ClientManager,
      USER_PERMISSIONS.CrestAdmin,
    ])
  ) {
    editable = false
  }

  if (!loading) {
    capacityTotal = event.capacity_total
    // capacityCounter = event.capacity_counter
    let ticket=[]
    ticketScanning && ticketScanning.forEach(item => {
      if(item.status=="scanned"){
        ticket.push(item)
      }
    })
    capacityCounter = ticket.length
  }

  const progress = (100 * capacityCounter) / capacityTotal || 0

  const variantClass = `CapacityView CapacityView--${variant}`
  const strokeColour = variant === 'ticket-scanning' ? '#3a4bc1' : 'white'
  const radius = variant === 'ticket-scanning' ? 65 : 50

  return (
    <div className={variantClass}>
      <div className="CapacityView__Venue">
        {editable ? (
          <EditableField
            value={capacityCounter}
            onSubmit={value => dispatch(setCapacityCounter(value))}
          />
        ) : (
          <span className="CapacityView__Value">{capacityCounter}</span>
        )}
        <div className="CapacityView__Venue-Title">Total in</div>
      </div>
      <div className="CapacityView__RingContainer">
        <ProgressRing
          radius={radius}
          stroke={5}
          strokeColour={strokeColour}
          progress={progress}
        />
        <div className="CapacityView__RingText">{Math.round(progress)}%</div>
      </div>
      <div className="CapacityView__Counter">
        <div>
          <span>Venue Capacity</span>
          <span>{capacityTotal}</span>
        </div>
        <hr />
        <div>
          <span>Remaining</span>
          <span>{capacityTotal - capacityCounter}</span>
        </div>
      </div>
    </div>
  )
}

CapacityView.propTypes = propTypes

CapacityView.defaultProps = {
  event: null,
  variant: 'dashboard',
}

export default compose(
  withUserContext,
  connect(state => ({
    event: state.currentEvent.event,
    ticketScanning: state.ticketScanningLogs.data,
    loading: state.currentEvent.event === null,
  })),
)(CapacityView)
