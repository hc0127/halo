import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Parse from 'parse'
import utils from '../utils/helpers'
import dashboardUtils from '../utils/dashboardFilterHelpers'
import Title from './common/Title/Title'
import { Loading } from './common'
import StaffListItem from './StaffListItem'
import Checkbox from './common/Checkbox/Checkbox'
import { loadStaff } from '../stores/ReduxStores/dashboard/staff'
import { setMapCenter } from '../stores/ReduxStores/dashboard/dashboard'
import { useInterval } from '../utils/customHooks'
import { USER_PERMISSIONS } from '../utils/constants'

const propTypes = {
  staff: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  event: PropTypes.instanceOf(Parse.Object),
  loading: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  onMapPage: PropTypes.bool,
}

const StaffList = ({ staff, event, loading, dispatch, onMapPage }) => {
  const [search, setSearch] = useState('')
  const [checkedLoggedUsers, setCheckedLoggedUsers] = useState(false)

  const handleCheckbox = useCallback(
    () => setCheckedLoggedUsers(!checkedLoggedUsers),
    [checkedLoggedUsers],
  )

  useInterval(() => {
    dispatch(loadStaff())
  }, 5000)

  useEffect(() => {
    dispatch(loadStaff())
  }, [dispatch])

  const staffOnShift = event
    ? staff.filter(user => user.current_event?.object_id === event.object_id)
    : []

  const filteredStaff = search
    ? staff.filter(
        user =>
          utils.isStringIn(search, user.name) ||
          utils.isStringIn(search, user.role),
      )
    : staff

  return (
    <section className={utils.makeClass('staff-list', onMapPage && 'map-page')}>
      <div className="staff-list__header">
        <div className="staff-list__header__title">
          <Title type="h3">People</Title>
          <div className="staff-list__header__shift">
            People on duty: {staffOnShift.length} out of {staff.length}
          </div>
        </div>
        <label
          className="staff-list__header__search-container"
          title="Find People"
        >
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="staff-list__header__search-input"
            placeholder="Search by name or role"
          />
        </label>
        <Checkbox
          label="Logged users"
          checked={checkedLoggedUsers}
          handleCheckbox={handleCheckbox}
        />
      </div>
      <div className="staff-list__content">
        {loading ? (
          <Loading />
        ) : (
          filteredStaff.map(user => (
            <StaffListItem
              key={user.object_id}
              user={user}
              onClick={() => {
                if (user.location) {
                  const formattedLocation = {
                    latitude: user.location.coordinates[1],
                    longitude: user.location.coordinates[0],
                  }
                  dispatch(setMapCenter(formattedLocation))
                }
              }}
              bookedOn={utils.isBookedOn(user, event)}
              checkedLoggedUsers={checkedLoggedUsers}
            />
          ))
        )}
      </div>
    </section>
  )
}

StaffList.propTypes = propTypes

StaffList.defaultProps = {
  event: null,
  onMapPage: false,
}

export default compose(
  connect(state => {
    const {
      auth: { currentUser },
    } = state
    const { geofenceIdFilter, groupIdFilter } = state.dashboard

    const geofences = state.eventGeofences.list

    const geofence = utils.getDataById(geofences, geofenceIdFilter)

    const staffGroups = state.staffGroups.list

    const staffGroup = staffGroups.find(
      ({ object_id }) => object_id === groupIdFilter,
    )

    const staffArr = Object.values(state.staff.data)

    return {
      staff:
        geofence || staffGroup
          ? staffArr.filter(
              dashboardUtils.filterStaffByGeofenceOrUserGroup(
                geofence,
                staffGroup,
              ),
            )
          : currentUser.permission_role ===
            USER_PERMISSIONS.TargetedDashboardUser
          ? dashboardUtils.filterStaffByUserGroups(staffGroups, staffArr)
          : staffArr,
      event: state.currentEvent.event,
      loading: state.staff.status === 'loading',
    }
  }),
)(StaffList)
