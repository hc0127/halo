import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import ChatIcon from '../ChatIcon/ChatIcon'
import Image from '../Image/Image'
import utils from '../../../utils/helpers'

const ChatBubbleStatus = {
  Sending: 'sending',
  SendingFailed: 'sending-failed',
  Sent: 'sent',
}

const propTypes = {
  name: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  side: PropTypes.oneOf(['left', 'right']).isRequired,
  status: PropTypes.oneOf(Object.values(ChatBubbleStatus)).isRequired,
  attachment: PropTypes.shape({ url: PropTypes.func.isRequired }),
  team: PropTypes.string.isRequired,
}

const ChatBubble = ({ name, text, date, side, status, attachment, team }) => {
  let bgColor = ''

  if (team == 'medic') {
    bgColor = '#cdf7df'
  } else if (team === 'fire') {
    bgColor = '#ffd4d4'
  } else if (team == 'housekeeping') {
    bgColor = '##f7edcd'
  } else if (team == 'police') {
    bgColor = '#b8d8fd'
  } else if (team == 'admin') {
    bgColor = '#94b8fb'
  }

  return (
    <div
      className={`ChatBubble ${
        side === 'left' ? 'ChatBubble--left' : 'ChatBubble--right'
      }`}
    >
      <div className="ChatBubble__icon">
        <ChatIcon name={name} />
      </div>
      <div className="ChatBubble__content">
        <div
          className="ChatBubble__bubble"
          style={{ backgroundColor: bgColor }}
        >
          <span className="ChatBubble__bubble__date">
            {new Date(date).toTimeString().substring(0, 5)}
          </span>
          <span className="ChatBubble__bubble__name">{name}</span>
          <span className="ChatBubble__bubble__text">
            {text &&
              text.split('\n').map(item => (
                <Fragment key={item}>
                  {item}
                  <br />
                </Fragment>
              ))}
          </span>
          <div className="ChatBubble__bubble__attachment">
            {attachment && (
              <Image
                src={window.getFileDefaultUrl() + attachment}
                alt="attachment"
              />
            )}
          </div>
        </div>
        {status !== ChatBubbleStatus.Sent ? (
          <div
            className={utils.makeClass(
              'ChatBubble__status',
              status === ChatBubbleStatus.SendingFailed ? 'failed' : null,
            )}
          >
            {status === ChatBubbleStatus.Sending ? 'Sending...' : null}
            {status === ChatBubbleStatus.SendingFailed
              ? 'Sending failed'
              : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

ChatBubble.propTypes = propTypes

ChatBubble.defaultProps = {
  attachment: null,
}

export default ChatBubble

export { ChatBubbleStatus }
