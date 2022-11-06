import React from 'react'
import PropTypes from 'prop-types'

const Badge = ({ badge }) => {
  return (
    <span
      style={{
        backgroundColor: badge.color,
        padding: '1px 8px',
        borderRadius: '100px',
        color: 'white',
      }}
    >
      {badge.label}
    </span>
  )
}

Badge.propTypes = {
  badge: PropTypes.shape({
    label: PropTypes.string,
    color: PropTypes.string,
  }).isRequired,
}

Badge.defaultProps = {}

export default Badge
