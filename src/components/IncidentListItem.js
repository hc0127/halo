import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import Icon from './Icon'
import utils from '../utils/helpers'
import { withUserContext } from '../Contexts'

const propTypes = {
  incident: PropTypes.instanceOf(Parse.Object).isRequired,
  customIncidentTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func,
  dispatch: PropTypes.func.isRequired,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
}

const IncidentListItem = ({
  incident,
  customIncidentTypes,
  onClick,
  currentUser,
  dispatch,
}) => {
  const [isIncidentRead, setIsIncidentRead] = useState(false)

  useEffect(() => {
    const _isIncidentRead = utils.isIncidentReadByUser(incident, currentUser)
    setIsIncidentRead(_isIncidentRead)

    return () => {}
  }, [incident, currentUser])

  const areMessagesRead =
    incident.message_read_list?.some(
      userId => userId === currentUser.object_id,
    ) ||
    // don't show as unread if there's no messages
    incident.incident_messages?.length === 0

  const isRead = isIncidentRead && areMessagesRead

  return (
    <div
      className={utils.makeClass(
        'incident-list-item',
        incident.resolved && 'resolved',
        isRead && 'read',
      )}
    >
      <button className="incident-list-item__button" onClick={onClick}>
        <div className="incident-list-item__icon">
          <Icon
            type={isRead ? incident.type_value || 'other' : 'unread'}
            size={30}
            rounded
          />
        </div>
        <div className="incident-list-item__text">
          <p
            className={utils.makeClass(
              ['incident-list-item', 'text', 'new-message'],
              !areMessagesRead && isIncidentRead && 'visible',
            )}
          >
            New Messages
          </p>
          <p className="incident-list-item__text__type">
            {utils.getIncidentName(incident.type_value, customIncidentTypes)}
          </p>
          <p className="incident-list-item__text__code">
            {incident.incident_code}
          </p>
          <p className="incident-list-item__text__what">
            {utils.getIncidentWhatText(incident)}
          </p>
        </div>
      </button>
    </div>
  )
}

IncidentListItem.propTypes = propTypes

IncidentListItem.defaultProps = {
  onClick: () => {},
}

export default withUserContext(IncidentListItem)
