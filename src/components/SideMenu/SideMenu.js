import React, { useState, lazy, Suspense } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Link } from 'react-router-dom'

import DialogCustomerSupport from '../Dialog/DialogCustomerSupport'

import { logout } from '../../stores/ReduxStores/auth'
import utils from '../../utils/helpers'
import { USER_PERMISSIONS } from '../../utils/constants'
import { withUserContext } from '../../Contexts'
import SiteVersion from '../SiteVersion'
import { closeSlidingView } from '../../stores/ReduxStores/dashboard/dashboard'
import { Icon } from '../common'
import { getIcon } from '../../stores/IconStore'
import HaloLogo from '../HaloLogo'

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({ id: PropTypes.string }).isRequired,
  }).isRequired,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
  event: PropTypes.instanceOf(Parse.Object),
  history: PropTypes.object.isRequired,
}

const defaultProps = {
  event: {},
}

const SideMenu2 = ({ history, dispatch, match, currentUser, event }) => {
  const eventId = match.params.id

  const hasAccessToReportAndDebrief = utils.hasPermission(currentUser, [
    USER_PERMISSIONS.CrestAdmin,
    USER_PERMISSIONS.ClientManager,
    USER_PERMISSIONS.TargetedDashboardUser,
  ])

  const [open, setOpen] = useState(false)
  const [dialogCustomerSupportOpen, setDialogCustomerSupprtOpen] = useState(
    false,
  )

  const handleClickCustomerSupport = () => {
    setDialogCustomerSupprtOpen(true)
  }

  const handleCloseDialogCustomerSupport = e => {
    const targetElement = e.target
    if (targetElement.id === 'backdrop') {
      setDialogCustomerSupprtOpen(false)
    }
  }

  const handleKeyDownForDialog = e => {
    const targetKey = e.key

    if (targetKey === 'Escape') {
      setDialogCustomerSupprtOpen(false)
    }
  }

  return (
    <div className={`SideMenu ${open ? 'SideMenu--open' : ''}`}>
      <div
        onClick={() => setOpen(!open)}
        aria-hidden="true"
        className="SideMenu__logo-container"
      >
        {open && (
          <Icon
            src={getIcon('hamburger')}
            size={40}
            style={{
              alignSelf: 'flex-end',
              cursor: ' pointer',
            }}
          />
        )}
        <HaloLogo className="SideMenu__logo" />
      </div>
      <div className="SideMenu__list">
        <ul>
          <li>
            <Link
              onClick={() => {
                dispatch(closeSlidingView())
                setOpen(false)
              }}
              to={`/dashboard/${eventId}`}
            >
              <Icon
                src={getIcon('dashboard')}
                size={20}
                style={{ cursor: 'pointer' }}
              />
              <p>Dashboard</p>
            </Link>
          </li>
          <li>
            <Link
              onClick={() => {
                dispatch(closeSlidingView())
                setOpen(false)
              }}
              to={`/dashboard/${eventId}/map`}
            >
              <Icon
                src={getIcon('mapIcon')}
                size={20}
                style={{ cursor: 'pointer' }}
              />
              <p>Map</p>
            </Link>
          </li>
          {event && utils.hasHaloChecks(event.client) && (
            <li>
              <Link
                onClick={() => {
                  dispatch(closeSlidingView())
                  setOpen(false)
                }}
                to={`/dashboard/${eventId}/venue-checks`}
              >
                <Icon
                  src={getIcon('taskList')}
                  size={20}
                  style={{ cursor: 'pointer' }}
                />
                <p>Tasks</p>
              </Link>
            </li>
          )}
          <li>
            <Link
              onClick={() => {
                dispatch(closeSlidingView())
                setOpen(false)
              }}
              to={`/dashboard/${eventId}/bans`}
            >
              <Icon
                src={getIcon('documentLibrary')}
                size={20}
                style={{ cursor: 'pointer' }}
              />
              <p>Bulletin Board</p>
            </Link>
          </li>
          <li>
            <Link
              onClick={() => {
                dispatch(closeSlidingView())
                setOpen(false)
              }}
              to={`/dashboard/${eventId}/document-library`}
            >
              <Icon
                src={getIcon('documentLibrary')}
                size={20}
                style={{ cursor: 'pointer' }}
              />
              <p>Document Library</p>
            </Link>
          </li>
          {hasAccessToReportAndDebrief && (
            <>
              <li>
                <Link
                  onClick={() => {
                    dispatch(closeSlidingView())
                    setOpen(false)
                  }}
                  to={`/dashboard/${eventId}/report`}
                >
                  <Icon
                    src={getIcon('reports')}
                    size={20}
                    style={{ cursor: 'pointer' }}
                  />
                  <p>Report</p>
                </Link>
              </li>
              {utils.hasTicketScanning(currentUser) && (
                <li>
                  <Link
                    onClick={() => {
                      dispatch(closeSlidingView())
                      setOpen(false)
                    }}
                    to={`/dashboard/${eventId}/ticket-scanning-report`}
                  >
                    <Icon
                      src={getIcon('scanner')}
                      size={20}
                      style={{ cursor: 'pointer' }}
                    />
                    <p>Ticket Scanning Report</p>
                  </Link>
                </li>
              )}
              <li>
                <Link
                  onClick={() => {
                    dispatch(closeSlidingView())
                    setOpen(false)
                  }}
                  to={`/dashboard/${eventId}/debrief`}
                >
                  <Icon
                    src={getIcon('debrief')}
                    size={20}
                    style={{ cursor: 'pointer' }}
                  />
                  <p>Debrief</p>
                </Link>
              </li>
            </>
          )}
          <li>
            <Link
              onClick={() => {
                dispatch(closeSlidingView())
                setOpen(false)
              }}
              to={`/dashboard/${eventId}/analytics`}
            >
              <Icon
                src={getIcon('analytics')}
                size={20}
                style={{ cursor: 'pointer' }}
              />
              <p>Analytics</p>
            </Link>
          </li>
          <div className="SideMenu__divider" />
          <li>
            <Link
              onClick={() => {
                dispatch(closeSlidingView())
                setOpen(false)
              }}
              to="/EventList"
            >
              <Icon
                src={getIcon('eventChange')}
                size={20}
                style={{ cursor: 'pointer' }}
              />
              <p>Change Event</p>
            </Link>
          </li>
          <li>
            <Icon
              src={getIcon('support')}
              size={24}
              style={{ cursor: 'pointer' }}
            />
            <button onClick={handleClickCustomerSupport}>
              Customer Support
            </button>
          </li>
          {/* <SiteVersion /> */}
        </ul>
        <div className="SideMenu__logoutBtn">
          <Icon
            src={getIcon('logoutIcon')}
            size={20}
            style={{ cursor: 'pointer' }}
          />
          <button
            onClick={() => {
              history.push('/login')
              dispatch(logout())
            }}
          >
            Log Out
          </button>
        </div>
      </div>
      {dialogCustomerSupportOpen ? (
        <DialogCustomerSupport
          open={dialogCustomerSupportOpen}
          onClose={handleCloseDialogCustomerSupport}
          onKeyDown={handleKeyDownForDialog}
        />
      ) : null}
    </div>
  )
}

SideMenu2.propTypes = propTypes

SideMenu2.defaultProps = defaultProps

export default compose(
  withUserContext,
  connect(state => ({
    event: state.currentEvent.event,
  })),
)(SideMenu2)
