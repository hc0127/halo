import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import PropTypes from 'prop-types'
import HaloLogo from './HaloLogo'
import CurrentTimeDisplay from './CurrentTimeDisplay'
import {
  openDialog,
  openIncidentForm,
} from '../stores/ReduxStores/dashboard/dashboard'
import { DIALOG_TYPE } from '../utils/constants'
import HeaderButton from './HeaderButton'

const propTypes = {
  event: PropTypes.object,
  client: PropTypes.object,
}

const defaultProps = {
  event: {},
  client: {},
}

const Header = ({ event, client }) => {
  // console.log('Header *** ', event, client)
  return (
    <header className="header">
      <div className="header__logo_container">
        <div className="header__logo">
          <HaloLogo adminEvent={event} client={client} />
        </div>
        {event && (
          <div className="header__event">
            <h3>{event.title}</h3>
          </div>
        )}
      </div>
      <div className="header__time">
        <CurrentTimeDisplay />
      </div>
      <div className="header__buttons">
        <HeaderButton
          icon="evacuate"
          action={openDialog(DIALOG_TYPE.EvacuateSite, {})}
        >
          Evacuate Site
        </HeaderButton>
        <HeaderButton
          icon="lockdown"
          action={openDialog(DIALOG_TYPE.LockdownZone, {})}
        >
          Lockdown Zone
        </HeaderButton>
        <HeaderButton
          icon="message"
          action={openDialog(DIALOG_TYPE.SendNotification, {})}
        >
          Send Notification
        </HeaderButton>
        <HeaderButton icon="unread" action={openIncidentForm()}>
          Report Incident
        </HeaderButton>
      </div>
    </header>
  )
}

Header.propTypes = propTypes

Header.defaultProps = defaultProps

export default compose(
  connect(state => {
    const { event } = state.currentEvent

    return {
      event,
    }
  }),
)(Header)
