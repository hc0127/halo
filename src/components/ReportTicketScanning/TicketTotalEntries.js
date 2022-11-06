import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  totalEntries: PropTypes.number.isRequired,
}

const TicketTotalEntries = ({ totalEntries }) => {
  return (
    <div className="ticket-total-entries">
      <div className="ticket-total-entries__report-header">Total Entries</div>
      <span className="ticket-total-entries__stat">{totalEntries}</span>
    </div>
  )
}

TicketTotalEntries.propTypes = propTypes

export default TicketTotalEntries
