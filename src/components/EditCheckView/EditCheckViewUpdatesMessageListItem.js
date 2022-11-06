import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import ChatBubble, { ChatBubbleStatus } from '../common/ChatBubble/ChatBubble'

const propTypes = {
  message: PropTypes.instanceOf(Parse.Object).isRequired,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
}

const EditCheckViewUpdatesMessageListItem = ({ message, currentUser }) => {
  const messageUser = message.user

  const messageStatus = (() => {
    if (!message.dirty) {
      return ChatBubbleStatus.Sent
    }

    if (message.failed === true) {
      return ChatBubbleStatus.SendingFailed
    }

    return ChatBubbleStatus.Sending
  })()

  const user = useMemo(() => {
    return !message.object_id ? currentUser : messageUser
  }, [currentUser, messageUser, message.object_id])

  if (!user) {
    return null
  }

  return (
    <ChatBubble
      side={user.object_id === currentUser.object_id ? 'right' : 'left'}
      name={user.name}
      text={message.message}
      date={message.sent_at.toString()}
      status={messageStatus}
      attachment={message.attachment}
    />
  )
}

EditCheckViewUpdatesMessageListItem.propTypes = propTypes

EditCheckViewUpdatesMessageListItem.defaultProps = {}

export default EditCheckViewUpdatesMessageListItem
