import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import moment from 'moment'

import utils from '../../utils/helpers'
import { withCustomIncidentTypesContext } from '../../Contexts'
import iconSearch from '../../images/icons/icon-search.svg'

import Title from '../common/Title/Title'
import AnalyticsFilterGroup from './AnalyticsFilterGroup'
import AnalyticsFilterTitle from './AnalyticsFilterTitle'
import AnalyticsFilterCheckboxList from './AnalyticsFilterCheckboxList'
import AnalyticsFilterDateTime from './AnalyticsFilterDateTime'
import AnalyticsFilterSearch from './AnalyticsFilterSearch'
import AnalyticsFilterTagList from './AnalyticsFilterTagList'

const idAndLabelArrayPropType = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }),
)

const propTypes = {
  incidentTypes: idAndLabelArrayPropType.isRequired,
  staffGroups: idAndLabelArrayPropType.isRequired,
  geofences: idAndLabelArrayPropType.isRequired,
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  staffGroupIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  geofenceIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  startDate: PropTypes.instanceOf(moment),
  endDate: PropTypes.instanceOf(moment),
  incidentStatuses: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  eventIncidentTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  searchTerm: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
  usersOptions: PropTypes.array.isRequired,
  permissions: PropTypes.object.isRequired,
}

const AnalyticsFilters = ({
  incidentTypes,
  staffGroups,
  geofences,
  types,
  staffGroupIds,
  geofenceIds,
  startDate,
  endDate,
  incidentStatuses,
  onChange,
  eventIncidentTags,
  permissions,
  tags,
  users,
  usersOptions,
  searchTerm,
}) => (
  <div className="analytics-filters">
    <Title type="h3">Filters</Title>
    <AnalyticsFilterGroup>
      <AnalyticsFilterTitle>Search</AnalyticsFilterTitle>
      <div className="analytics-filters__search">
        <input
          type="search"
          onChange={e =>
            onChange('searchTerm', e.target.value.toLocaleLowerCase())
          }
          value={searchTerm}
        />{' '}
        <img src={iconSearch} alt="" />
      </div>
    </AnalyticsFilterGroup>
    <AnalyticsFilterGroup>
      <AnalyticsFilterTitle>Time and Date</AnalyticsFilterTitle>
      <AnalyticsFilterDateTime
        value={startDate}
        onChange={value => onChange('startDate', value)}
        label="Start Date"
      />
      <AnalyticsFilterDateTime
        value={endDate}
        onChange={value => onChange('endDate', value)}
        label="End Date"
      />
    </AnalyticsFilterGroup>
    <AnalyticsFilterGroup>
      <AnalyticsFilterTitle>People</AnalyticsFilterTitle>
      <AnalyticsFilterCheckboxList
        options={usersOptions}
        values={users}
        onCheck={(option, checked) => {
          onChange(
            'users',
            checked
              ? users.concat(option.id)
              : users.filter(id => id !== option.id),
          )
        }}
        onCheckAll={checked => {
          onChange('users', checked ? usersOptions.map(({ id }) => id) : [])
        }}
      />
    </AnalyticsFilterGroup>
    <AnalyticsFilterGroup>
      <AnalyticsFilterTitle>Incident Type</AnalyticsFilterTitle>
      <AnalyticsFilterCheckboxList
        options={incidentTypes}
        values={types}
        onCheck={(option, checked) => {
          onChange(
            'types',
            checked
              ? types.concat(option.id)
              : types.filter(id => id !== option.id),
          )
        }}
        onCheckAll={checked => {
          onChange('types', checked ? incidentTypes.map(({ id }) => id) : [])
        }}
      />
    </AnalyticsFilterGroup>
    <AnalyticsFilterGroup>
      <AnalyticsFilterTitle>Incident Tag</AnalyticsFilterTitle>
      <AnalyticsFilterSearch
        onClickSuggestion={tag => {
          onChange('tags', tags.concat(tag))
        }}
        tags={eventIncidentTags.filter(tag => tags.indexOf(tag) === -1)}
      />
      <AnalyticsFilterTagList tags={tags} onChange={onChange} />
    </AnalyticsFilterGroup>
    <AnalyticsFilterGroup>
      <AnalyticsFilterTitle>Resolved</AnalyticsFilterTitle>
      <AnalyticsFilterCheckboxList
        options={[
          { id: 'openIncident', label: 'Open Incident' },
          { id: 'closedIncident', label: 'Closed Incident' },
        ]}
        values={incidentStatuses}
        onCheck={(option, checked) => {
          onChange(
            'incidentStatuses',
            checked
              ? incidentStatuses.concat(option.id)
              : incidentStatuses.filter(id => id !== option.id),
          )
        }}
        onCheckAll={checked => {
          onChange(
            'incidentStatuses',
            checked ? ['openIncident', 'closedIncident'] : [],
          )
        }}
      />
    </AnalyticsFilterGroup>
    <AnalyticsFilterGroup>
      <AnalyticsFilterTitle>Geofences</AnalyticsFilterTitle>
      <AnalyticsFilterCheckboxList
        options={geofences}
        values={geofenceIds}
        onCheck={(option, checked) => {
          onChange(
            'geofenceIds',
            checked
              ? geofenceIds.concat(option.id)
              : geofenceIds.filter(id => id !== option.id),
          )
        }}
        onCheckAll={checked => {
          onChange('geofenceIds', checked ? geofences.map(({ id }) => id) : [])
        }}
      />
    </AnalyticsFilterGroup>
    {permissions.userGroups && (
      <AnalyticsFilterGroup>
        <AnalyticsFilterTitle>Teams</AnalyticsFilterTitle>
        <AnalyticsFilterCheckboxList
          options={staffGroups}
          values={staffGroupIds}
          onCheck={(option, checked) => {
            onChange(
              'staffGroupIds',
              checked
                ? staffGroupIds.concat(option.id)
                : staffGroupIds.filter(id => id !== option.id),
            )
          }}
          onCheckAll={checked => {
            onChange(
              'staffGroupIds',
              checked ? staffGroups.map(({ id }) => id) : [],
            )
          }}
        />
      </AnalyticsFilterGroup>
    )}
  </div>
)

AnalyticsFilters.propTypes = propTypes

AnalyticsFilters.defaultProps = {
  startDate: null,
  endDate: null,
}

export default compose(
  withCustomIncidentTypesContext,
  connect((state, { customIncidentTypes }) => {
    const incidents = Object.values(state.incidents.data).concat(
      state.incidents.closedIncidentList,
    )

    const incidentTypes = incidents
      .map(incident => incident.type_value)
      .filter((value, index, array) => array.indexOf(value) === index)
      .map(incidentType => ({
        id: incidentType,
        label: utils.getIncidentName(incidentType, customIncidentTypes),
      }))

    const geofences = [
      ...state.eventGeofences.list.map(geofence => ({
        id: geofence.id,
        label: geofence.name,
      })),
      { id: 'notInGeofence', label: 'Not In Geofence' },
    ]
    const staffGroups = state.staffGroups.list.map(group => ({
      id: group.object_id,
      label: group.name,
    }))

    const eventIncidentTags = [
      ...new Set(utils.flattenArray(incidents.map(incident => incident.tags))),
    ].filter(tag => tag !== null)

    const permissions = {
      userGroups:
        state.currentEvent.event &&
        utils.hasUserGroups(state.currentEvent.event.client),
    }

    const removeDuplicateUsers = users =>
      users.filter(
        ({ id }, index) => users.findIndex(user => user.id === id) === index,
      )

    const usersOptions = removeDuplicateUsers(
      incidents.map(incident => ({
        id: incident.reported_by.object_id,
        label: incident.reported_by.name,
      })),
    )

    return {
      incidentTypes,
      geofences,
      staffGroups,
      eventIncidentTags,
      permissions,
      usersOptions,
    }
  }),
)(AnalyticsFilters)
