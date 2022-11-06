import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import Parse from 'parse'
import DashboardButton from '../../DashboardButton'
import { VARIANT } from '../../../utils/constants'
import NiceCheckbox from '../../AdminTable/NiceCheckbox'

const SEARCH_TYPE = {
  Geofence: 'geofence',
  Group: 'group',
  Member: 'member',
}

const propTypes = {
  staff: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  staffGroups: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  geofences: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.string),
}

const SelectMembers = ({
  staff,
  staffGroups,
  geofences,
  onChange,
  selected,
}) => {
  const [search, setSearch] = useState('')

  const isSelected = useCallback(user => selected.includes(user.object_id), [
    selected,
  ])

  const selectDeselectUser = useCallback(
    user => {
      onChange(
        isSelected(user)
          ? [...selected.filter(id => id !== user.object_id)]
          : [...selected, user.object_id],
      )
    },
    [isSelected, selected, onChange],
  )

  const isFiltered = search !== ''

  const filteredStaff = useMemo(() => {
    const [type, value] = search.split(':')

    let staffIds = []

    switch (type) {
      case SEARCH_TYPE.Geofence:
        staffIds = (
          geofences.find(geofence => geofence.id === value).users || []
        ).map(user => user.object_id)
        break
      case SEARCH_TYPE.Group:
        staffIds = staffGroups.find(group => group.object_id === value)?.users
        break
      case SEARCH_TYPE.Member:
        staffIds = [staff.find(member => member.object_id === value).object_id]
        break
      default:
        return staff
    }

    return staff.filter(member => staffIds.includes(member.object_id))
  }, [search, geofences, staffGroups, staff])

  const isAllSelected = useMemo(() => filteredStaff.every(isSelected), [
    filteredStaff,
    isSelected,
  ])

  const selectAll = useCallback(() => {
    onChange([
      ...new Set([
        ...selected,
        ...filteredStaff.map(member => member.object_id),
      ]),
    ])
  }, [onChange, selected, filteredStaff])

  const deselectAll = useCallback(() => {
    const toRemove = filteredStaff.map(member => member.object_id)
    onChange(selected.filter(value => !toRemove.includes(value)))
  }, [onChange, selected, filteredStaff])

  const getDropdownTitle = () => {
    const parts = []
    if (geofences.length) {
      parts.push('locations')
    }
    if (staffGroups.length) {
      parts.push('teams')
    }
    if (staff.length) {
      parts.push('staff')
    }
    return `Search ${parts.join(', ')}`
  }

  const dropdownOptions = useMemo(() => {
    const options = []

    if (search) {
      options.push({ label: 'Remove Filter', value: '' })
    }

    if (geofences && geofences.length > 0) {
      options.push({
        label: 'Geofence Locations',
        options: geofences.map(geofence => ({
          value: `${SEARCH_TYPE.Geofence}:${geofence.object_id}`,
          label: geofence.name,
        })),
      })
    }

    if (staffGroups && staffGroups.length > 0) {
      options.push({
        label: 'Teams',
        options: staffGroups.map(group => ({
          value: `${SEARCH_TYPE.Group}:${group.object_id}`,
          label: group.name,
        })),
      })
    }

    if (filteredStaff && filteredStaff.length > 0) {
      options.push({
        label: 'Staff',
        options: filteredStaff.map(member => ({
          value: `${SEARCH_TYPE.Member}:${member.object_id}`,
          label: member.name,
        })),
      })
    }

    return options
  }, [geofences, staffGroups, filteredStaff, search])

  return (
    <div className="select-members">
      <Select
        className="select-members__select"
        classNamePrefix="select-members__select"
        options={dropdownOptions}
        onChange={option => setSearch(option.value)}
        value={
          search
            ? dropdownOptions.find(option => option.value === search)
            : { value: '', label: getDropdownTitle() }
        }
      />

      <div>
        <DashboardButton
          variant={VARIANT.Link}
          onClick={isAllSelected ? deselectAll : selectAll}
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
          {isFiltered ? ' (Filtered)' : ''}
        </DashboardButton>
      </div>

      <ul className="select-members__select-users">
        {filteredStaff.map(user => (
          <li key={user.object_id}>
            <div className="select-members__select-users__user">
              <NiceCheckbox
                checked={isSelected(user)}
                onChange={() => selectDeselectUser(user)}
              />

              <div className="select-members__select-users__name-container">
                <span className="select-members__select-users__name ellipsis">
                  {user.name}
                </span>
                <span className="select-members__select-users__role">
                  {user.role}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

SelectMembers.propTypes = propTypes

SelectMembers.defaultProps = {
  selected: [],
}

export default SelectMembers
