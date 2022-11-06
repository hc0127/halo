import React from 'react'
import PropTypes from 'prop-types'
import utils from '../../../utils/helpers'

const ChatIcon = ({ name, size, backgroundColor, color }) => {
  const initials = utils.getInitials(name)

  const style = {
    height: size,
    width: size,
    lineHeight: `${size}px`,
    borderRadius: `${size}px`,
    backgroundColor,
    color,
    marginRight: '12px',
  }

  return (
    <div style={style} className="ChatIcon">
      {initials}
    </div>
  )
}

ChatIcon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
}

ChatIcon.defaultProps = {
  size: 40,
  backgroundColor: 'lightgrey',
  color: 'inherit',
}

export default ChatIcon
