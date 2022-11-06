import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import Card from './Card'
import DashboardPinIcon from './DashboardPin/DashboardPinIcon'
import { ChatIcon } from './common'
import ClickableDiv from './ClickableDiv'

import utils from '../utils/helpers'
import MobileNumber from './MobileNumber'

const propTypes = {
  user: PropTypes.instanceOf(Parse.Object).isRequired,
  onClick: PropTypes.func.isRequired,
  bookedOn: PropTypes.bool,
  checkedLoggedUsers: PropTypes.bool,
}

const StaffListItem = ({ user, onClick, bookedOn, checkedLoggedUsers }) => {
  const userIsActive = utils.isUserActive(user)
  const status = userIsActive ? 'present' : 'not-updated-recently'
  const bookedStatus = bookedOn ? 'booked-on' : 'booked-off'

  const userUpdatedAt = utils.getFormattedDateOffset(user.updated_at)

  return !checkedLoggedUsers ||
    (checkedLoggedUsers && status === 'present' && bookedOn) ? (
    <div
      className={`staff-list__item ${utils.makeClass(
        'staff-list__item',
        status,
        bookedStatus,
      )}`}
    >
      <Card>
        <ClickableDiv onClick={() => bookedOn && onClick()}>
          <div className="staff-list__item__pin">
            <DashboardPinIcon
              type={user.pin}
              customPinSrc={user.pin_icon_url?.url}
              active={userIsActive && bookedOn}
            >
              <ChatIcon
                size={15}
                name={user.name}
                backgroundColor="transparent"
                color="white"
              />
            </DashboardPinIcon>
          </div>
          <div className="staff-list__item__container">
            <div className="staff-list__item__name">{user.name}</div>
            {/* <div className="staff-list__item__role">{user.role}</div> */}
            {/* <div className="staff-list__item__phone">
              <MobileNumber>{user.mobile_number}</MobileNumber>
            </div> */}
            <div className="staff-list__item__last-updated">
              Last updated: {userUpdatedAt}
            </div>
          </div>
        </ClickableDiv>
      </Card>
    </div>
  ) : null
}

StaffListItem.propTypes = propTypes

StaffListItem.defaultProps = {
  bookedOn: null,
  checkedLoggedUsers: false,
}

export default StaffListItem
