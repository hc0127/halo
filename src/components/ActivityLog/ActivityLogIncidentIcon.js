import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import { Icon } from '../common'
import { getIconNoFallback } from '../../stores/IconStore'
import { useParseFetch } from '../../utils/customHooks'

const propTypes = {
  incident: PropTypes.instanceOf(Parse.Object).isRequired,
}

const ActivityLogIncidentIcon = props => {
  const incident = useParseFetch(props.incident, 'typeValue')

  if (!incident) {
    return null
  }

  const src = getIconNoFallback(incident.type_value)

  return src ? (
    <Icon src={src} size={30} backgroundColor="#284D8F" borderRadius="50%" />
  ) : null
}

ActivityLogIncidentIcon.propTypes = propTypes

ActivityLogIncidentIcon.defaultProps = {}

export default ActivityLogIncidentIcon
