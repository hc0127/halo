import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment'

import ReportIncidents from '../../../components/ReportIncidentList/ReportIncidents'
import ActivityLogs from '../../../components/ReportActivityLogs/ReportActivityLogs'

import dashboardUtils from '../../../utils/dashboardFilterHelpers'
import utils from '../../../utils/helpers'
import { USER_PERMISSIONS } from '../../../utils/constants'

const PrintIncidentPDF = () => {
  const incidents = useSelector(state => state.incidents)
  const staffGroups = useSelector(state => state.staffGroups.list)
  const closedIncidentList = useSelector(
    state => state.incidents.closedIncidentList,
  )
  const { permission_role } = useSelector(state => state.auth.currentUser)
  const logs = useSelector(state => Object.values(state.logs.data))

  const closedIncidents = utils.sort(
    Object.values(incidents.data).concat(closedIncidentList),
    ({ created_at }) => created_at,
    'desc',
  )

  const malIncidents = [
    ...dashboardUtils.filterIncidentsByUserGroups(staffGroups, closedIncidents),
  ]

  const selectedIncident =
    (permission_role === USER_PERMISSIONS.TargetedDashboardUser
      ? malIncidents
      : closedIncidents
    ).filter(
      incident =>
        incident.incident_code === incidents?.selectedTableIncident?.urn,
    ) ?? []

  return (
    <div className="dashboard-page-print_incident_pdf">
      <ReportIncidents incidents={selectedIncident} />
      <div>
        <div className="dashboard-page-print_incident_pdf-section-title">
          Activity Logs
        </div>

        <table className="dashboard-page-print_incident_pdf-test">
          <tr>
            <th>Date & Time</th>
            <th>Message</th>
            <th>Log Type</th>
          </tr>
          {logs.map(log => (
            <tr key={log.created_at}>
              <td>{moment(log.created_at).format('DD/MM/YYYY HH:mm:ss')}</td>
              <td>{log.log_message}</td>
              <td>{log.log_type}</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  )
}

export default PrintIncidentPDF
