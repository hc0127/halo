import React from 'react'
import PropTypes from 'prop-types'

import StandardPin from '../../images/pins/pin-standard.svg'
import StandardPinInactive from '../../images/pins/pin-standard-inactive.svg'

import AdminPin from '../../images/pins/pin-admin.svg'
import AdminPinInactive from '../../images/pins/pin-admin-inactive.svg'

import FirePin from '../../images/pins/pin-fire.svg'
import FirePinInactive from '../../images/pins/pin-fire-inactive.svg'

import MedicPin from '../../images/pins/pin-medic.svg'
import MedicPinInactive from '../../images/pins/pin-medic-inactive.svg'

import LeadCarPin from '../../images/pins/pin-leadcar.svg'
import LeadCarPinInactive from '../../images/pins/pin-leadcar-inactive.svg'

import HousekeepingPin from '../../images/pins/pin-housekeeping.svg'
import HousekeepingPinInactive from '../../images/pins/pin-housekeeping-inactive.svg'

import PolicePin from '../../images/pins/pin-police.svg'
import PolicePinInactive from '../../images/pins/pin-police-inactive.svg'

import IncidentPin from '../../images/pins/pin-incident.svg'
import IncidentPinInactive from '../../images/pins/pin-incident-inactive.svg'

const pinByType = {
  standard: {
    active: StandardPin,
    inactive: StandardPinInactive,
  },
  admin: {
    active: AdminPin,
    inactive: AdminPinInactive,
  },
  fire: {
    active: FirePin,
    inactive: FirePinInactive,
  },
  medic: {
    active: MedicPin,
    inactive: MedicPinInactive,
  },
  leadcar: {
    active: LeadCarPin,
    inactive: LeadCarPinInactive,
  },
  housekeeping: {
    active: HousekeepingPin,
    inactive: HousekeepingPinInactive,
  },
  police: {
    active: PolicePin,
    inactive: PolicePinInactive,
  },
  incident: {
    active: IncidentPin,
    inactive: IncidentPinInactive,
  },
  custom: {
    active: StandardPin,
    inactive: StandardPinInactive,
  },
}

const propTypes = {
  type: PropTypes.string.isRequired,
  children: PropTypes.node,
  customPinSrc: PropTypes.string,
  active: PropTypes.bool,
}

const DashboardPinIcon = ({ type, children, customPinSrc, active }) => (
  <div className="dashboard-pin-icon">
    <img
      className="dashboard-pin-icon__image"
      src={pinByType[type][active ? 'active' : 'inactive']}
      alt="pin"
    />
    {children && (type === 'standard' || type === 'incident') && (
      <div className="dashboard-pin-icon__content">{children}</div>
    )}
    {type === 'custom' && customPinSrc && (
      <div className="dashboard-pin-icon__content">
        <img
          src={customPinSrc}
          alt=""
          className={`dashboard-pin-icon__custom-pin-image ${!active &&
            'dashboard-pin-icon__custom-pin-image--inactive'}`}
        />
      </div>
    )}
  </div>
)

DashboardPinIcon.propTypes = propTypes

DashboardPinIcon.defaultProps = {
  children: null,
  customPinSrc: null,
  active: true,
}

export default DashboardPinIcon
