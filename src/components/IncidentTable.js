import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import PropTypes from 'prop-types'
import moment from 'moment'
import utils from '../utils/helpers'
import Parse from 'parse'

import { withUserContext } from '../Contexts'
import { AdminTable } from './AdminTable'
import {
  INCIDENT_PRIORITY,
  INCIDENT_STATUS,
  INCIDENT_STATUS_FOR_USER as STATUS_FOR_USER,
  BG_COLORS_INCIDENT_STATUS_FOR_USER as BG_COLORS,
} from '../utils/constants'
import Badge from './common/Badge'
import _ from 'lodash'

import {
  setIncidentsForTable,
  setSelectedIncidentTable,
} from '../stores/ReduxStores/dashboard/incidents'

const propTypes = {
  incidents: PropTypes.arrayOf(Parse.Object).isRequired,
  customIncidentTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  filter: PropTypes.instanceOf(Parse.Object),
  onClick: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
  IncidentsForTable: PropTypes.arrayOf(Parse.Object).isRequired,
  selectedTableIncident: PropTypes.instanceOf(Parse.Object),
}

const IncidentTable = ({
  incidents,
  customIncidentTypes,
  filter,
  onClick,
  currentUser,
  incidentsTableData,
  selectedTableIncident,
  dispatch,
}) => {
  const prepareIncidents = async () => {
    let data = {
      notViewed: [],
      notViewed_mins: [],
      hasUpdates: [],
      viewed: [],
    }

    for (let incident of incidents) {
      // filter the incident according to incident type
      if (incident.type_value !== filter.value && filter.value !== '') {
        continue
      }

      let { userStatus, rowBgColor } = getIncidentUserStatus(incident)
      let priority = getPriority(incident)
      let status = getStatus(incident)

      let preparedIncidents = {
        id: incident.object_id,
        priority: priority,
        priorityOrder: priority?.props?.badge?.priority,
        type: utils.getIncidentName(incident.type_value, customIncidentTypes),
        urn: incident.incident_code,
        createdBy: incident.reported_by?.name,
        time: moment(incident.created_at).format('HH:mm'),
        age: utils.getTimeDiffAsMinutes(incident.created_at),
        lastUpdated: moment(incident.updated_at).format('DD-MM-YY HH:mm'),
        status: status,
        userStatus,
        rowBgColor,
      }

      if (userStatus === STATUS_FOR_USER.NotViewed_mins) {
        data.notViewed_mins.push(preparedIncidents)
      } else if (userStatus === STATUS_FOR_USER.NotViewed)
        data.notViewed.push(preparedIncidents)
      else if (userStatus === STATUS_FOR_USER.UpdateNotViewed)
        data.hasUpdates.push(preparedIncidents)
      else {
        data.viewed.push(preparedIncidents)
      }
    }

    let sortedData = []
    Object.keys(data).forEach(key => {
      let sorted = _.orderBy(
        data[key],
        ['status', 'priorityOrder', 'age'],
        [undefined, 'asc', 'asc'],
      )
      sortedData.push(...sorted)
    })

    dispatch(setIncidentsForTable(sortedData))
  }

  useEffect(() => {
    prepareIncidents()
  }, [filter, incidents])

  const getPriority = incident => {
    const priority = incident.capture_data?.priority || ''

    switch (priority.toLowerCase()) {
      case 'critical': {
        return <Badge badge={INCIDENT_PRIORITY.Critical} />
      }
      case 'high': {
        return <Badge badge={INCIDENT_PRIORITY.High} />
      }
      case 'medium': {
        return <Badge badge={INCIDENT_PRIORITY.Medium} />
      }
      case 'low': {
        return <Badge badge={INCIDENT_PRIORITY.Low} />
      }
      case 'info': {
        return <Badge badge={INCIDENT_PRIORITY.Info} />
      }

      default:
        return
    }
  }

  const getStatus = incident => {
    let status = INCIDENT_STATUS.New
    if (incident.resolved) status = INCIDENT_STATUS.Resolved
    if (incident.archived) status = INCIDENT_STATUS.Archived

    return status
  }

  const getIncidentUserStatus = incident => {
    let userStatus = STATUS_FOR_USER.Default
    let rowBgColor = BG_COLORS.Color_Default

    // if (incident.capture_data?.priority) return { userStatus, rowBgColor }
    // if (incident.reported_by?.object_id === currentUser.object_id)
    //   return { userStatus, rowBgColor }

    if (!isRead(incident)) {
      if (incident.resolved) return { userStatus, rowBgColor }

      if (
        incident.created_at &&
        utils.getTimeDiffAsMinutes(incident.created_at) > 15
      ) {
        userStatus = STATUS_FOR_USER.NotViewed_mins
        rowBgColor = BG_COLORS.Color_NotViewed_mins
      } else {
        userStatus = STATUS_FOR_USER.NotViewed
        rowBgColor = BG_COLORS.Color_NotViewed
      }
    } else if (hasUpdate(incident)) {
      userStatus = STATUS_FOR_USER.UpdateNotViewed
      rowBgColor = BG_COLORS.Color_UpdateNotViewed
    }

    return { userStatus, rowBgColor }
  }

  const isRead = incident => {
    return incident.user_views.length > 0
  }

  const hasUpdate = incident => {
    const areMessagesRead =
      incident.message_read_list?.length !== 0 &&
      incident.message_read_list?.length === 1 &&
      incident.message_read_list[0] !== currentUser.object_id

    return areMessagesRead
  }

  const handleClick = incident => {
    if (selectedTableIncident?.id !== incident.id)
      dispatch(setSelectedIncidentTable(incident))

    return onClick(incident.id)
  }

  return (
    <div className="incident-table">
      <AdminTable
        onRowClick={row => handleClick(row)}
        headers={[
          'Priority',
          'Type',
          'URN',
          'Created By',
          'Time',
          'Age (Mins)',
          'Last Updated',
          'Status',
        ]}
        incidentTable={true}
        isPaginated={true}
        columns={[
          'priority',
          'type',
          'urn',
          'createdBy',
          'time',
          'age',
          'lastUpdated',
          'status',
        ]}
        data={incidentsTableData}
        // customRenders={customRenders}
      />
    </div>
  )
}

IncidentTable.propTypes = propTypes

IncidentTable.defaultProps = {
  onClick: () => {},
}

export default compose(
  withUserContext,
  connect(state => {
    let incidentsTableData = state.incidents.tableData
    let selectedTableIncident = state.incidents.selectedTableIncident

    return {
      incidentsTableData,
      selectedTableIncident,
    }
  }),
)(IncidentTable)
