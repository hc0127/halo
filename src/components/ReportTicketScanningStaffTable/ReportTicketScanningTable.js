import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ReportTicketScanningTableBody from './ReportTicketScanningTableBody'
import TicketScanningTablePagination from './TicketScanningTablePagination'
import utils, { getAllTicketLogs } from '../../utils/helpers'
import moment from 'moment'

const propTypes = {
  staff: PropTypes.object,
  count: PropTypes.number.isRequired,
  eventId: PropTypes.string.isRequired,
  eventAws:PropTypes.array.isRequired
}

const defaultProps = {
  staff: {},
}

const parseData = (staff, ticketScanningLogs,eventAws) => {
  if (Object.keys(staff).length === 0) {
    return []
  }

  const scans = {}

  ticketScanningLogs.forEach(log => {
  log.logs && log.logs.forEach(item => {
    let userName=eventAws?.filter(name => name.user_id==item?.updated_by)[0]?.username
    const user = item
    if (!scans[user?.updated_by]) {
      scans[user?.updated_by] = {
        initials: utils.getInitials(userName??"staf"),
        name: userName??"staff",
        totalScans: [],
        recentScans: [],
      }
    }
    scans[user?.updated_by].totalScans.push(item)

    if (moment().diff(user?.updated_at, 'minutes') < 15) {
      if (scans[user.updated_by].recentScans !== undefined) {
        scans[user.updated_by].recentScans.push(log)
      }
    }
  })
  })
  return scans
  
}

const ReportTicketScanningTable = ({ staff, count, eventId ,eventAws}) => {
  const [ticketEntries, setTicketEntries] = useState([])
  const [isLoading, setLoading] = useState(false)
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      const ticketScans = await getAllTicketLogs(count, eventId)
      setLoading(false)
      setTicketEntries(ticketScans)
    }
    fetchLogs()
  }, [])

  const staffData = parseData(staff, ticketEntries,eventAws)

  const limit = 5
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages =
    Object.values(staffData).length < limit
      ? 1
      : Math.ceil(Object.values(staffData).length / limit)

  const pageData = Object.values(staffData).slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  )

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1)
  }

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1)
  }

  const handleSkipToPage = page => {
    setCurrentPage(page)
  }

  return (
    <>
      <table className="report-ticket-scanning-table">
        <thead>
          <tr>
            <th></th>
            <th>People</th>
            <th>Past 15 Minutes</th>
            <th>Total Scans</th>
          </tr>
        </thead>
        <ReportTicketScanningTableBody data={pageData} isLoading={isLoading} />
      </table>

      {totalPages > 1 && (
        <TicketScanningTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          nextPage={handleNextPage}
          previousPage={handlePreviousPage}
          jumpToPage={handleSkipToPage}
        />
      )}
    </>
  )
}

ReportTicketScanningTable.propTypes = propTypes

ReportTicketScanningTable.defaultProps = defaultProps

export default ReportTicketScanningTable
