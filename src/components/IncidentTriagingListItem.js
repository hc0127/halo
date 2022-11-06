import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import moment from 'moment'

import Title from './common/Title/Title'

import iconWarningYellow from '../images/icon-warning-yellow.svg'
import IncidentTypeName from './IncidentTypeName'
import { VARIANT } from '../utils/constants'
import DashboardButton from './DashboardButton'

const propTypes = {
  incident: PropTypes.instanceOf(Parse.Object).isRequired,
  onClick: PropTypes.func.isRequired,
}

const IncidentTriagingListItem = ({ incident, onClick }) => {
  const reportedBy = incident.reported_by

  return (
    <div className="incident-triaging__list-item">
      <img src={iconWarningYellow} alt="important" />
      <div className="incident-triaging__list-item__text-container">
        <Title type="h4">
          Incident <IncidentTypeName>{incident}</IncidentTypeName> reported
        </Title>
        <p>
          {moment(incident.created_at).format('HH:mm')} -{' '}
          {reportedBy && reportedBy.name} ({reportedBy && reportedBy.role})
        </p>
      </div>
      <DashboardButton
        variant={VARIANT.Warning}
        onClick={() => onClick(incident)}
      >
        View
      </DashboardButton>
    </div>
  )
}

IncidentTriagingListItem.propTypes = propTypes

IncidentTriagingListItem.defaultProps = {}

export default IncidentTriagingListItem
