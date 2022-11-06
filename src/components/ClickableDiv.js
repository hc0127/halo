import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  className: PropTypes.string,
}

const ClickableDiv = ({ className, ...props }) => (
  <button className={`clickable-div ${className}`} {...props} />
)

ClickableDiv.propTypes = propTypes

ClickableDiv.defaultProps = {
  className: '',
}

export default ClickableDiv
