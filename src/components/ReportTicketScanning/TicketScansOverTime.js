import React from 'react'
import PropTypes from 'prop-types'
import TicketScanningLineGraph from '../ReportGraphs/TicketScanningLineGraph/TicketScanningLineGraph'

const propTypes = {
  filters: PropTypes.array,
  onFilter: PropTypes.func,
  chartFilterBy: PropTypes.string,
  ticketScanningLogs: PropTypes.array.isRequired,
}

const defaultProps = {
  filters: [],
  onFilter: () => {},
  chartFilterBy: '',
}

const TicketScansOverTime = ({
  filters,
  ticketScanningLogs,
  onFilter,
  chartFilterBy,
}) => {
  return (
    <div className="ticket-scans-over-time__chart">
      <div className="ticket-scans-over-time__report-header">
        Entries Over Time
      </div>
      {ticketScanningLogs.length === 0 && (
        <div className="ticket-scans-over-time__no-data-message">
          <p>No data to display.</p>
        </div>
      )}

      {ticketScanningLogs.length > 0 && (
        <div>
          <div className="selector ticket-scans-over-time__selector">
            <select /* eslint-disable-line */
              className="ticket-scans-over-time__chart-filter"
              onChange={onFilter}
            >
              {filters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
          <TicketScanningLineGraph chartFilterBy={chartFilterBy} />
        </div>
      )}
    </div>
  )
}

TicketScansOverTime.propTypes = propTypes

TicketScansOverTime.defaultProps = defaultProps

export default TicketScansOverTime
