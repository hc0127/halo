import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import moment from 'moment'
import Parse from 'parse'

import utils from '../../utils/helpers'
import googleMapsUtil from '../../utils/googleMapsUtil'

import AnalyticsListHeader from './AnalyticsListHeader'
import IncidentTypeName from '../IncidentTypeName'
import ButtonWithIcon from '../common/ButtonWithIcon'
import { BUTTON_ICONS } from '../../utils/constants'
import { withCustomIncidentTypesContext } from '../../Contexts'
import {
  getAllIncidentMessages,
  loadAllMessages,
} from '../../stores/ReduxStores/dashboard/incidentMessages'
import { openIncidentView } from '../../stores/ReduxStores/dashboard/dashboard'
import DashboardButton from '../DashboardButton'
import { CLIENT_FEATURES } from '../../utils/constants'

const propTypes = {
  incidents: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  onFilterRemove: PropTypes.func.isRequired,
  customIncidentTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  incidentsLoaded: PropTypes.bool.isRequired,
  incidentMessages: PropTypes.array.isRequired,
  incidentMessagesLoaded: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
}

const exportToCsv = (incidents, customIncidentTypes, incidentMessages) => {
  const lines = [
    [
      'Incident ID',
      'Incident Type',
      'Source / Code',
      'Title',
      'Tags',
      'Informant Name',
      'Reported At',
      'Reported By',
      'Resolved At',
      'Resolved Message',
      'Resolved By',
      'Closed At',
      'Closed Message',
      'Debrief',
      'Status',
      'Messages',
    ],
  ]

  const formatMessages = messages =>
    messages
      .map(message => `${message.user.name}: ${message.message}`)
      .join(' | ')

  incidents.forEach(incident => {
    const messages = incidentMessages[incident.id]

    const concatMessages = messages ? formatMessages(messages) : ''
    const informantFirstName = incident.capture_data.informantFirstName
      ? incident.capture_data.informantFirstName
      : '-'
    const informantLastName = incident.capture_data.informantLastName
      ? incident.capture_data.informantLastName
      : ''
    const incidentSource = incident.capture_data.hotlineCallSource
      ? incident.capture_data.hotlineCallSource
      : '-'
    const incidentTags = incident.tags ? incident.tags : '-'

    lines.push([
      incident.incident_code,
      utils.getIncidentName(incident.type_value, customIncidentTypes),

      incident.capture_data.hotlineCallSource
        ? incident.capture_data.hotlineCallSource +
          ' / ' +
          incident.capture_data.hotlineCallType
        : incident.capture_data.incidentCode,
      utils.getIncidentWhatText(incident),
      incidentTags,
      informantFirstName + ' ' + informantLastName,
      moment(incident.created_at).format('DD/MM/YYYY HH:mm'),
      incident.reported_by.name,
      incident.resolved_date &&
        moment(incident.resolved_date).format('DD/MM/YYYY HH:mm'),
      incident.resolved_text,
      incident.resolved_by && incident.resolved_by.name,
      incident.archived_date &&
        moment(incident.archived_date).format('DD/MM/YYYY HH:mm'),
      incident.archived_text,
      incident.debrief ? 'Yes' : 'No',
      (incident.archived && 'Closed') ||
        (incident.resolved && 'Resolved') ||
        'Open',
      concatMessages,
    ])
  })

  const csv = lines
    .map(line =>
      line
        .map(column => `"${`${column || ''}`.replace(/"/g, '""')}"`)
        .join(','),
    )
    .join('\r\n')

  const anchor = document.createElement('a')
  const mimeType = 'text/csv;encoding:utf-8'
  const filename = 'incidents-analytics.csv'

  anchor.href = URL.createObjectURL(new Blob([csv], { type: mimeType }))
  anchor.setAttribute('download', filename)
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

const checkSearchTerm = (incident, searchTerm) => {
  let target = ''

  const concatPrimitiveValue = item => {
    if (item && typeof item === 'object' && Object.values(item).length) {
      for (let [key, value] of Object.entries(item)) {
        concatPrimitiveValue(value)
      }
    } else {
      const dateItem = new Date(item)

      target += isNaN(dateItem)
        ? JSON.stringify(item).toLowerCase()
        : dateItem.toString()

      return
    }
  }

  for (const [key, value] of Object.entries(incident)) {
    let targetValue = value

    if (key === 'capture_data') {
      targetValue = JSON.stringify(value)
    }

    concatPrimitiveValue(targetValue)
  }

  const replacedTarget = target.replaceAll('undefined', '').replaceAll(' ', '')

  return replacedTarget.includes(searchTerm)
}

const AnalyticsList = ({
  incidents,
  incidentsLoaded,
  onFilterRemove,
  customIncidentTypes,
  incidentMessages,
  incidentMessagesLoaded,
  dispatch,
  ...filters
}) => {
  useEffect(() => {
    if (incidentsLoaded) {
      dispatch(loadAllMessages())
    }
    return () => {}
  }, [dispatch, incidentsLoaded])

  return (
    <div className="analytics-list">
      <div className="analytics-list__container">
        <AnalyticsListHeader onFilterRemove={onFilterRemove} {...filters} />

        <div className="analytics-list__download-container">
          <ButtonWithIcon
            disabled={!incidentMessagesLoaded}
            icon={BUTTON_ICONS.Download}
            onClick={() =>
              exportToCsv(incidents, customIncidentTypes, incidentMessages)
            }
            title="Download CSV"
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Incident ID</th>
              <th>Incident Type</th>
              <th>Reported At</th>
              <th>Source / Code</th>
              <th>Tags</th>
              <th>Informant Name</th>
              <th>Resolved At</th>
              <th>Status</th>
              <th>Closed Message</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(incident => (
              <tr key={incident.id}>
                <td>{incident.incident_code}</td>
                <td>
                  <IncidentTypeName>{incident}</IncidentTypeName>
                </td>
                <td>
                  {moment(incident.created_at).format('DD/MM/YYYY HH:mm')}
                </td>
                {incident.capture_data.hotlineCallSource ? (
                  <td>
                    {incident.capture_data.hotlineCallSource} /{' '}
                    {incident.capture_data.hotlineCallType}
                  </td>
                ) : (
                  <td>{incident.capture_data.incidentCode}</td>
                )}
                <td>{incident.tags}</td>
                {incident.capture_data.informantFirstName ? (
                  <td>
                    {incident.capture_data.informantFirstName}{' '}
                    {incident.capture_data.informantLastName}
                  </td>
                ) : (
                  <td>{incident.capture_data.edgName}</td>
                )}
                <td>
                  {incident.resolved_date
                    ? moment(incident.resolved_date).format('DD/MM/YYYY HH:mm')
                    : '-'}
                </td>
                <td>
                  {(incident.archived && 'Closed') ||
                    (incident.resolved && 'Resolved') ||
                    'Open'}
                </td>
                <td>{incident.archived_text}</td>
                <td>
                  <DashboardButton
                    onClick={() => {
                      dispatch(openIncidentView(incident.id))
                    }}
                  >
                    View
                  </DashboardButton>
                </td>
              </tr>
            ))}
            {incidents.length === 0 && (
              <tr>
                <td>No results found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

AnalyticsList.propTypes = propTypes

AnalyticsList.defaultProps = {}

export default compose(
  withCustomIncidentTypesContext,
  connect(
    (
      state,
      {
        types,
        staffGroupIds,
        geofenceIds,
        startDate,
        endDate,
        incidentStatuses,
        tags,
        searchTerm,
        users,
      },
    ) => {
      const staffGroups = state.staffGroups.list.filter(({ object_id }) =>
        staffGroupIds.includes(object_id),
      )

      const staffIds = utils
        .flattenArray(staffGroups.map(group => group.users))
        .map(id => id)

      const geofences = state.eventGeofences.list.filter(({ id }) =>
        geofenceIds.includes(id),
      )

      const allZones = state.eventGeofences.list.map(geofence =>
        googleMapsUtil.getGeofenceZone(geofence),
      )
      const geofenceZones = geofences.map(geofence =>
        googleMapsUtil.getGeofenceZone(geofence),
      )

      const incidentMessages = getAllIncidentMessages(state)

      let incidents = Object.values(state.incidents.data)
        .concat(state.incidents.closedIncidentList)
        // types
        .filter(
          incident => !types.length || types.includes(incident.type_value),
        )
        // staff groups
        .filter(
          incident =>
            !staffGroupIds.length ||
            staffIds.includes(incident.reported_by.object_id),
        )
        // geofences
        .filter(incident => {
          const notInGeofence = !allZones.some(zone =>
            googleMapsUtil.isIncidentInGeofence(incident, zone),
          )
          const inFilteredGeofenceZone = geofenceZones.some(zone =>
            googleMapsUtil.isIncidentInGeofence(incident, zone),
          )

          if (
            geofenceIds.includes('notInGeofence') &&
            geofenceIds.length === 1
          ) {
            return notInGeofence
          }

          if (geofenceIds.includes('notInGeofence') && geofenceIds.length > 1) {
            return notInGeofence || inFilteredGeofenceZone
          }

          return !geofenceIds.length || inFilteredGeofenceZone
        })
        // start date
        .filter(
          incident =>
            !startDate || moment(incident.created_at).isAfter(startDate),
        )
        // end date
        .filter(
          incident => !endDate || moment(incident.created_at).isBefore(endDate),
        )
        // statuses
        .filter(
          incident =>
            !incidentStatuses.length ||
            incidentStatuses.includes(
              !incident.archived ? 'openIncident' : 'closedIncident',
            ),
        )
        // tags
        .filter(
          incident =>
            !tags.length ||
            (incident.tags && incident.tags.some(tag => tags.includes(tag))),
        )
        //search terms
        .filter(incident => checkSearchTerm(incident, searchTerm))
        // users
        .filter(
          incident =>
            !users.length ||
            (incident.reported_by &&
              users.includes(incident.reported_by.object_id)),
        )

      // filtering out duplicate incident due to race condition where reopened incident exists in both closed and active lists
      incidents = incidents.filter(
        (incident, index, self) =>
          index ===
          self.findIndex(
            comparator => comparator.object_id === incident.object_id,
          ),
      )

      return {
        incidents: utils.sort(
          incidents,
          ({ created_at }) => created_at,
          'desc',
        ),
        incidentMessages,
        incidentsLoaded: state.incidents.status === 'loaded',
        incidentMessagesLoaded: state.incidentMessages.status === 'loaded',
      }
    },
  ),
)(AnalyticsList)
