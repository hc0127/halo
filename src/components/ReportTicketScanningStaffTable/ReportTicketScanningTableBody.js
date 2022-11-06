import React from 'react'
import PropTypes from 'prop-types'

import { Loading } from '../common'

const propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool.isRequired,
}

const defaultProps = {
  data: [],
}

const ReportTicketScanningTableBody = ({ data, isLoading }) => {
  return (
    <tbody>
      {data.length > 0 &&
        data.map(row => {
          return (
            <tr key={row.name}>
              <td>
                <span className="initials-icon">{row.initials}</span>
              </td>
              <td>{row.name}</td>
              <td>{row.recentScans.length}</td>
              <td>{row.totalScans.length}</td>
            </tr>
          )
        })}
      {data.length === 0 && (
        <tr>
          <td colSpan={4} className="no-data-message">
            {isLoading ? <Loading /> : 'No staff ticket scanning data'}
          </td>
        </tr>
      )}
    </tbody>
  )
}

ReportTicketScanningTableBody.propTypes = propTypes

ReportTicketScanningTableBody.defaultProps = defaultProps

export default ReportTicketScanningTableBody
