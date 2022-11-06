import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import { ChatIcon } from '../common'
import ClickableDiv from '../ClickableDiv'
import Title from '../common/Title/Title'
import DashboardPinIcon from './DashboardPinIcon'
import MobileNumber from '../MobileNumber'

import utils from '../../utils/helpers'

const propTypes = {
  user: PropTypes.instanceOf(Parse.Object).isRequired,
  onClick: PropTypes.func.isRequired,
  zIndex: PropTypes.number,
  event: PropTypes.instanceOf(Parse.Object).isRequired,
}

const StaffPin = ({ user, onClick, zIndex, event }) => {
  const [popupOpen, setPopupOpen] = useState(false)

  const userIsActive = utils.isUserActive(user)
  const location = user.location

  const bookedOn = utils.isBookedOn(user, event)

  if (!location || !bookedOn) {
    return null
  }

  return (
    <div
      className="dashboard-pin dashboard-pin--staff"
      style={
        zIndex
          ? {
              zIndex,
              position: 'relative',
              width: 0,
              height: 0,
            }
          : null
      }
    >
      <ClickableDiv
        onClick={() => {
          setPopupOpen(!popupOpen)
          onClick({ lat: location.latitude, lng: location.longitude })
        }}
      >
        <DashboardPinIcon
          type={user.pin}
          active={userIsActive}
          customPinSrc={user.pin_icon_url && user.pin_icon_url}
        >
          <ChatIcon
            size={20}
            name={user.name}
            backgroundColor="transparent"
            color="white"
          />
        </DashboardPinIcon>
      </ClickableDiv>

      <ClickableDiv onClick={() => setPopupOpen(!popupOpen)}>
        <div
          className={`dashboard-pin__popup ${
            popupOpen ? 'dashboard-pin__popup--open' : ''
          }`}
        >
          <div className="dashboard-pin__popup__wrapper">
            <div className="dashboard-pin__popup__body">
              <ChatIcon size={50} name={user.name} />
              <div>
                <Title type="h3">{user.name}</Title>
                <div className="dashboard-pin__popup__body__role">
                  {user.role}
                </div>
                {user.mobile_number && (
                  <div className="dashboard-pin__popup__body__mobile">
                    <MobileNumber>{user.mobile_number}</MobileNumber>
                  </div>
                )}
              </div>
            </div>
            <div className="dashboard-pin__popup__footer">
              <hr />
              {user.battery_percent
                ? `${user.battery_percent}% | ${user.battery_percent}`
                : 'No battery information'}
            </div>
          </div>
        </div>
      </ClickableDiv>
    </div>
  )
}

StaffPin.propTypes = propTypes

StaffPin.defaultProps = {
  zIndex: null,
}

export default StaffPin
