import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Parse from 'parse'
import moment from 'moment'
import GoogleMapReact from 'google-map-react'
import { openDialog } from '../../stores/ReduxStores/dashboard/dashboard'
import ClickableDiv from '../ClickableDiv'
import utils from '../../utils/helpers'
import {
  BUTTON_ICONS,
  CHECK_STATUS,
  CHECK_STATUS_TEXT,
  CHECK_TYPE_TEXT,
  DIALOG_TYPE,
  RECURRING_PERIOD,
  RECURRING_PERIOD_TEXT_SHORT,
} from '../../utils/constants'
import { Icon } from '../common'
import SvgIcon from '../common/Icon/Icon'
import { default as BtnIcon } from '../common/Icon'
import { getIcon } from '../../stores/IconStore'
import { updateAssigneesOnCheck } from '../../stores/ReduxStores/dashboard/eventChecks'
import googleMapStyles from '../MapContainer/mapStyles'
import iconRecurring from '../../images/icons/icon-recurring.svg'
import EditCheckViewDetailsLocationPin from './EditCheckViewDetailsLocationPin'
import Image from '../common/Image/Image'

const propTypes = {
  check: PropTypes.instanceOf(Parse.Object).isRequired,
  dispatch: PropTypes.func.isRequired,
  geofences: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  staffGroups: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  staff: PropTypes.objectOf(PropTypes.instanceOf(Parse.Object)).isRequired,
}

const EditCheckViewDetails = ({
  check,
  dispatch,
  geofences,
  staffGroups,
  staff,
}) => {
  const status = useMemo(
    () => (check ? utils.getEventCheckStatus(check) : null),
    [check],
  )

  const adminCheck = check.admin_check
  const completedByUser = staff[check.completed_by]

  const users = useMemo(() => {
    if (!staff) {
      return []
    }

    const users = check.users || []
    return users.map(id => ({ user: staff[id], id }))
  }, [check, staff])

  const assignUsers = useCallback(
    userIds => {
      dispatch(updateAssigneesOnCheck(check, userIds))
    },
    [check, dispatch],
  )

  const removeUser = useCallback(
    id => {
      const users = [...(check.users || [])]
      const ind = users.indexOf(id)
      if (ind === -1) {
        return
      }

      users.splice(ind, 1)
      assignUsers(users)
    },
    [assignUsers, check],
  )

  const assignUser = useCallback(() => {
    dispatch(
      openDialog(DIALOG_TYPE.AssignUserToCheck, {
        check,
        geofences,
        staffGroups,
        staff: Object.values(staff),
        assignUsers,
      }),
    )
  }, [geofences, staffGroups, staff, check, assignUsers, dispatch])

  const getAdminCheckImageStyle = useCallback(() => {
    if (!adminCheck || !adminCheck.image) {
      return {}
    }

    return {
      backgroundImage: `url("${adminCheck.image}")`,
    }
  }, [adminCheck])

  if (!adminCheck) {
    return null
  }

  const location = check.completed_location
    ? {
        latitude: check.completed_location.coordinates[0],
        longitude: check.completed_location.coordinates[1],
      }
    : null

  return (
    <div className="edit-check-view__details">
      <div className="edit-check-view__details__row">
        <div className="edit-check-view__details__field">Zones</div>
        <div className="edit-check-view__details__value">
          {adminCheck.zones
            ? adminCheck.zones.map(zone => (
                <div
                  className={utils.makeClass('tag-input__tag', 'filled')}
                  key={zone}
                >
                  {zone}
                </div>
              ))
            : 'No zones'}
        </div>
      </div>
      <div className="edit-check-view__details__row">
        <div className="edit-check-view__details__field">Type</div>
        <div className="edit-check-view__details__value">
          {CHECK_TYPE_TEXT[adminCheck.event_type]}
        </div>
      </div>
      <div className="edit-check-view__details__row">
        <div className="edit-check-view__details__field">Date</div>
        <div className="edit-check-view__details__value">
          {moment.utc(check.occurs_at).format('DD/MM/YYYY HH:mm')}
        </div>
      </div>
      <div className="edit-check-view__details__row">
        <div className="edit-check-view__details__field">From</div>
        <div className="edit-check-view__details__value">
          {moment.utc(check.occurs_at).time()}
          {adminCheck.recurring_period !== RECURRING_PERIOD.Never ? (
            <>
              <SvgIcon src={iconRecurring} size={16} />
              {RECURRING_PERIOD_TEXT_SHORT[adminCheck.recurring_period]}
            </>
          ) : null}
        </div>
      </div>
      <div className="edit-check-view__details__row">
        <div className="edit-check-view__details__field">Assignee</div>
        <div className="edit-check-view__details__value">
          {users.map(({ user, id }) => (
            <div
              className={utils.makeClass('tag-input__tag', 'filled')}
              key={id}
            >
              {user ? user.name : 'Unknown'}
              {check.status === CHECK_STATUS.Pending && users.length > 1 ? (
                <ClickableDiv onClick={() => removeUser(id)}>
                  <Icon src={getIcon('cross')} size={10} />
                </ClickableDiv>
              ) : null}
            </div>
          ))}

          {check.status !== CHECK_STATUS.Complete ? (
            <ClickableDiv onClick={assignUser}>
              <div className={utils.makeClass('tag-input__tag')}>
                Assign&nbsp;
                <BtnIcon icon={BUTTON_ICONS.Add} size={10} />
              </div>
            </ClickableDiv>
          ) : null}
        </div>
      </div>
      <div className="edit-check-view__details__row">
        <div className="edit-check-view__details__field">Status</div>
        <div className="edit-check-view__details__value">
          <div className={utils.makeClass('check-status', status)} />
          {CHECK_STATUS_TEXT[status] || 'Unknown status'}
        </div>
      </div>
      {adminCheck.image ? (
        <div className="edit-check-view__details__row">
          <div className="edit-check-view__details__field">Check Image</div>
          <div className="edit-check-view__details__value">
            <a
              href={adminCheck.image}
              target="_blank"
              rel="noopener noreferrer"
              className="edit-check-view__details__value__image"
              style={getAdminCheckImageStyle()}
            >
              <span style={{ display: 'none' }}>{adminCheck.title}</span>
            </a>
          </div>
        </div>
      ) : null}
      {check.status === CHECK_STATUS.Complete ? (
        <>
          <div className="edit-check-view__details__row">
            <div className="edit-check-view__details__field">Completed by</div>
            <div className="edit-check-view__details__value">
              {completedByUser ? completedByUser.name : 'Unknown'}
            </div>
          </div>
          <div className="edit-check-view__details__row">
            <div className="edit-check-view__details__field">Completed at</div>
            <div className="edit-check-view__details__value">
              {check.completed_at
                ? moment(check.completed_at).format('DD/MM/YYYY HH:mm')
                : ''}
            </div>
          </div>
          <div className="edit-check-view__details__row">
            <div className="edit-check-view__details__field">Comment</div>
            <div className="edit-check-view__details__value">
              {check.completed_comment || 'No comment'}
            </div>
          </div>
          <div className="edit-check-view__details__row">
            <div className="edit-check-view__details__field">Photo</div>
            <div className="edit-check-view__details__value">
              {check.completed_image ? (
                <Image src={check.completed_image.url} alt={adminCheck.title} />
              ) : (
                'No photo'
              )}
            </div>
          </div>
          <div className="edit-check-view__details__row edit-check-view__details__row--with-map">
            <div className="edit-check-view__details__field">Location</div>
            <div className="edit-check-view__details__value">
              {location ? (
                <div className="edit-check-view__details__map">
                  <GoogleMapReact
                    options={{
                      options: { styles: googleMapStyles },
                      mapTypeIds: ['roadmap', 'satellite', 'styled_map'],
                      mapTypeControl: true,
                      streetViewControl: true,
                    }}
                    bootstrapURLKeys={{
                      key: 'AIzaSyBnOvtYtXW2OVevBs0R47mxdXdYiEQA3Po',
                    }}
                    defaultCenter={{
                      lat: location.latitude,
                      lng: location.longitude,
                    }}
                    defaultZoom={18}
                    yesIWantToUseGoogleMapApiInternals
                  >
                    <EditCheckViewDetailsLocationPin
                      lat={location.latitude}
                      lng={location.longitude}
                    />
                  </GoogleMapReact>
                </div>
              ) : (
                'No location'
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

EditCheckViewDetails.propTypes = propTypes

EditCheckViewDetails.defaultProps = {}

export default connect(state => ({
  check: state.eventChecks.data[state.dashboard.openedCheckId],
  geofences: state.geofences.list,
  staffGroups: state.staffGroups.list,
  staff: state.staff.data,
}))(EditCheckViewDetails)
