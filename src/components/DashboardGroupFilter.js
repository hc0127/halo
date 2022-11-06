import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import Select from 'react-select'
import utils from './../utils/helpers'
import { USER_PERMISSIONS } from '../utils/constants'
import { withUserContext } from '../Contexts'

const propTypes = {
  geofences: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  staffGroups: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
}

const getDefaultOption = (geofences, staffGroups, currentUser, value) => {
  if (value) {
    return 'Remove Filter'
  }

  if (
    geofences.length > 0 &&
    staffGroups.length > 0 &&
    !utils.hasPermission(currentUser, [USER_PERMISSIONS.TargetedDashboardUser])
  ) {
    return 'Select Team or Geofence'
  } else if (
    geofences.length > 0 &&
    !utils.hasPermission(currentUser, [USER_PERMISSIONS.TargetedDashboardUser])
  ) {
    return 'Select Geofence'
  } else if (staffGroups.length > 0) {
    return 'Select Team'
  }

  return 'No filter available'
}

const getOptions = (geofences, staffGroups, currentUser, value) => {
  const options = [
    {
      value: '',
      label: getDefaultOption(geofences, staffGroups, currentUser, value),
    },
  ]

  if (
    geofences.length > 0 &&
    !utils.hasPermission(currentUser, [USER_PERMISSIONS.TargetedDashboardUser])
  ) {
    options.push({
      label: 'Geofence Locations',
      options: utils
        .sort(geofences, geofence => geofence.created_at, 'asc')
        .map(geofence => ({
          value: `geofence:${geofence.id}`,
          label: geofence.name,
        })),
    })
  }

  if (staffGroups.length > 0) {
    options.push({
      label: 'Teams',
      options: staffGroups.map(group => ({
        value: `group:${group.object_id}`,
        label: group.name,
      })),
    })
  }

  return options
}

const DashboardGroupFilter = ({
  geofences,
  staffGroups,
  onChange,
  value,
  currentUser,
}) => (
  <div className="dashboard-group-filter">
    <Select
      className="dashboard-group-filter__select"
      classNamePrefix="dashboard-group-filter__select"
      options={getOptions(geofences, staffGroups, currentUser, value)}
      onChange={option => onChange(option.value)}
      value={
        getOptions(geofences, staffGroups, currentUser).filter(
          option => option.value === value,
        )[0]
      }
      hasGroup
    />
  </div>
)

DashboardGroupFilter.propTypes = propTypes

DashboardGroupFilter.defaultProps = { value: '' }

export default withUserContext(DashboardGroupFilter)
