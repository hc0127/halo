import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import { ChatBubble, Loading } from './common'

const propTypes = {
  incidentMessage: PropTypes.instanceOf(Parse.Object).isRequired,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
}

const IncidentMessageListItem = ({ incidentMessage, currentUser }) => {
  const user = incidentMessage.user

  if (user === null) {
    return <Loading />
  }

  return (
    <ChatBubble
      side={user.object_id === currentUser.object_id ? 'right' : 'left'}
      name={user.name}
      team={user.pin}
      text={incidentMessage.message}
      date={incidentMessage.sent_at.toString()}
      attachment={incidentMessage.attachment}
    />
  )
}

IncidentMessageListItem.propTypes = propTypes

IncidentMessageListItem.defaultProps = {}

export default IncidentMessageListItem
