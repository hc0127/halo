import React from 'react'
import CapacityView from '../CapacityView/CapacityView'

const CapacityOverview = () => {
  return (
    <div className="capacity-overview">
      <div className="capacity-overview__report-header">Capacity Counter</div>
      <div className="capacity-overview__capacity-view">
        <CapacityView variant="ticket-scanning" />
      </div>
    </div>
  )
}

export default CapacityOverview
