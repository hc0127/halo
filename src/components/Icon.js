import React from 'react'
import PropTypes from 'prop-types'
import { getIcon } from '../stores/IconStore'

const propTypes = {
  type: PropTypes.string.isRequired,
  size: PropTypes.number,
  rounded: PropTypes.bool,
}

const Icon = ({ type, size, rounded }) => (
  <div
    className={`icon ${rounded ? 'icon--rounded' : ''}`}
    style={{
      backgroundImage: `url(${getIcon(type)})`,
      height: size,
      width: size,
    }}
  />
)

Icon.propTypes = propTypes

Icon.defaultProps = { size: 25, rounded: false }

export default Icon
