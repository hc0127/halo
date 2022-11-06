import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Link, withRouter } from 'react-router-dom'
import {
  ROUTES,
  BUTTON_ICONS,
  VARIANT,
  CLIENT_FEATURES,
} from '../utils/constants'
import { Icon } from './common'
import { AdminButton } from './common/Admin'
import HaloLogo from './HaloLogo'
import utils from '../utils/helpers'
import { withUserContext } from '../Contexts'
import { logout } from '../stores/ReduxStores/auth'
import SiteVersion from './SiteVersion'
import { releaseNotesSrc } from '../utils/releaseNotes'
import { getIcon } from '../stores/IconStore'

const menus = [
  {
    route: ROUTES.Private.AdminClients,
    label: 'Clients',
    icon: 'settings',
    permission: 'CrestAdmin',
  },
  {
    route: ROUTES.Private.AdminEvents,
    label: 'Events/Clients',
    icon: 'calendarIcon',
    permission: 'both',
  },
  {
    route: ROUTES.Private.AdminUsers,
    label: 'People',
    icon: 'userIcon',
    permission: 'both',
  },
  {
    route: ROUTES.Private.AdminUserGroups,
    label: 'Teams',
    icon: 'people',
    permission: 'both',
    feature: CLIENT_FEATURES.UserGroups,
  },
  {
    route: ROUTES.Private.AdminTicketScanning,
    label: 'Ticket Scanning',
    icon: 'scanner',
    permission: 'both',
    feature: CLIENT_FEATURES.TicketScanning,
  },
  {
    route: ROUTES.Private.AdminDocumentUpload,
    label: 'Document Library',
    icon: 'documentLibrary',
    permission: 'both',
    //feature: CLIENT_FEATURES.DocumentUpload,
  },
]

const propTypes = {
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired })
    .isRequired,
  dispatch: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
}

const AdminSidebar = ({ history, location, dispatch, currentUser }) => {
  useEffect(() => {
    const script = document.createElement('script')
    script.innerHTML = releaseNotesSrc
    document.body.appendChild(script)
  }, [])
  const [open, setOpen] = useState(false)

  return (
    <div className={`SideMenu ${open ? 'SideMenu--open' : ''}`}>
      <div
        onClick={() => setOpen(!open)}
        aria-hidden="true"
        className="SideMenu__logo-container"
      >
        <HaloLogo className="SideMenu__logo" />
      </div>
      <div className="SideMenu__list">
        <ul>
          {menus
            .filter(
              menu =>
                menu.permission === currentUser.permission_role ||
                menu.permission === 'both',
            )
            .filter(menu =>
              menu.feature
                ? utils.hasMenuFeatures(currentUser, menu.feature)
                : true,
            )
            .filter(
              menu =>
                menu.label !== 'Teams' ||
                (menu.label === 'Teams' &&
                  currentUser.client.enabled_features.includes('userGroups')),
            )
            .map(menu => (
              <li
                key={menu.route}
                // className={menu.route === location.pathname ? 'selected' : ''}
              >
                <Link to={menu.route}>
                  <Icon
                    src={getIcon(menu.icon)}
                    size={24}
                    style={{ cursor: 'pointer' }}
                  />
                  <p>{menu.label}</p>
                </Link>
              </li>
            ))}
        </ul>
        <ul className="admin-sidebar__bottom-container">
          <li className="admin-sidebar__ReleaseNotes rn-badge">
            <Icon
              src={getIcon('relaseNote')}
              size={24}
              style={{ cursor: 'pointer' }}
            />
            <button
              onClick={e => {
                e.preventDefault()
              }}
            >
              Release Notes
            </button>
          </li>
          <li className="SideMenu__logoutBtn">
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
          </li>
        </ul>
        {/* <SiteVersion /> */}
      </div>
    </div>
  )
}

AdminSidebar.propTypes = propTypes

AdminSidebar.defaultProps = {}

export default compose(withRouter, withUserContext, connect())(AdminSidebar)
