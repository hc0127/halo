import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import moment from 'moment'

import utils from '../../utils/helpers'
import { withCustomIncidentTypesContext } from '../../Contexts'

import AnalyticsFilterPill from './AnalyticsFilterPill'

const idAndLabelArrayPropType = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
)

const propTypes = {
  onFilterRemove: PropTypes.func.isRequired,
  types: idAndLabelArrayPropType.isRequired,
  staffGroups: idAndLabelArrayPropType.isRequired,
  geofences: idAndLabelArrayPropType.isRequired,
  startDate: PropTypes.instanceOf(moment),
  endDate: PropTypes.instanceOf(moment),
  incidentStatuses: idAndLabelArrayPropType.isRequired,
  users: PropTypes.array.isRequired,
}

const AnalyticsListHeader = ({
  onFilterRemove,
  types,
  staffGroups,
  geofences,
  startDate,
  endDate,
  incidentStatuses,
  users,
}) => {
  let displayText = ''

  const formattedStartDate = startDate && startDate.format('DD/MM/YYYY HH:mm')
  const formattedEndDate = endDate && endDate.format('DD/MM/YYYY HH:mm')

  if (startDate && endDate) {
    displayText = ` between ${formattedStartDate} and ${formattedEndDate}`
  } else if (startDate) {
    displayText = ` after ${formattedStartDate}`
  } else if (endDate) {
    displayText = ` before ${formattedEndDate}`
  }

  const isFiltering =
    types.length ||
    staffGroups.length ||
    geofences.length ||
    incidentStatuses.length ||
    startDate ||
    endDate ||
    users.length

  return (
    <div className="analytics-list__header">
      <div>
        Displaying {!isFiltering ? 'all' : ''} incidents{displayText}:
      </div>
      <div>
        {types.map(type => (
          <AnalyticsFilterPill
            key={`types:${type.id}`}
            onRemove={() => onFilterRemove('types', type.id)}
          >
            {type.label}
          </AnalyticsFilterPill>
        ))}
        {staffGroups.map(group => {
          return (
            <AnalyticsFilterPill
              key={`groups:${group.id}`}
              onRemove={() => onFilterRemove('staffGroupIds', group.id)}
            >
              {group.label}
            </AnalyticsFilterPill>
          )
        })}
        {geofences.map(geofence => (
          <AnalyticsFilterPill
            key={`geofence:${geofence.id}`}
            onRemove={() => onFilterRemove('geofenceIds', geofence.id)}
          >
            {geofence.label}
          </AnalyticsFilterPill>
        ))}
        {incidentStatuses.map(status => (
          <AnalyticsFilterPill
            key={`status:${status.id}`}
            onRemove={() => onFilterRemove('incidentStatuses', status.id)}
          >
            {status.label}
          </AnalyticsFilterPill>
        ))}
        {users.map(user => (
          <AnalyticsFilterPill
            key={`user:${user.id}`}
            onRemove={() => onFilterRemove('users', user.id)}
          >
            {user.label}
          </AnalyticsFilterPill>
        ))}
      </div>
    </div>
  )
}

AnalyticsListHeader.propTypes = propTypes

AnalyticsListHeader.defaultProps = {
  startDate: null,
  endDate: null,
}

export default compose(
  withCustomIncidentTypesContext,
  connect(
    (
      state,
      {
        types,
        staffGroupIds,
        geofenceIds,
        incidentStatuses,
        customIncidentTypes,
        users,
      },
    ) => {
      const incidentTypes = Object.values(state.incidents.data)
        .map(incident => incident.type_value)
        .filter((value, index, array) => array.indexOf(value) === index)
        .filter(incidentType => types.includes(incidentType))
        .map(incidentType => ({
          id: incidentType,
          label: utils.getIncidentName(incidentType, customIncidentTypes),
        }))

      const filteredGeofences = state.eventGeofences.list
        .filter(({ id }) => geofenceIds.includes(id))
        .map(geofence => ({ id: geofence.id, label: geofence.name }))

      const geofences = geofenceIds.includes('notInGeofence')
        ? [
            { id: 'notInGeofence', label: 'Not In Geofence' },
            ...filteredGeofences,
          ]
        : filteredGeofences

      const staffGroups = state.staffGroups.list
        .filter(({ object_id }) => staffGroupIds.includes(object_id))
        .map(group => {
          return { id: group.object_id, label: group.name }
        })

      const statuses = [
        { id: 'openIncident', label: 'Open' },
        { id: 'closedIncident', label: 'Closed' },
      ].filter(status => incidentStatuses.includes(status.id))

      const usersArray = Object.values(state.incidents.data).map(
        incident => incident.reported_by,
      )
      const filterableUsers = usersArray
        .filter(
          ({ id }, index) =>
            usersArray.findIndex(user => user.id === id) === index,
        )
        .filter(user => users.includes(user.id))
        .map(user => ({ id: user.id, label: user.get('name') }))

      return {
        types: incidentTypes,
        geofences,
        staffGroups,
        incidentStatuses: statuses,
        users: filterableUsers,
      }
    },
  ),
)(AnalyticsListHeader)
