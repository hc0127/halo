import React from 'react'
import PropTypes from 'prop-types'

import { BUTTON_ICONS } from '../../utils/constants'
import utils from '../../utils/helpers'

const Icon = ({ icon, size, disabled, selected }) => {
  switch (icon) {
    default:
      return (
        <span
          style={{ fontSize: size }}
          className={`icon icon-icon-${icon}${disabled ? '-disabled' : ''}${
            selected ? '-selected' : ''
          }`}
          title={utils.makeReadable(icon)}
        />
      )
  }
}

Icon.propTypes = {
  icon: PropTypes.oneOf(Object.values(BUTTON_ICONS)).isRequired,
  size: PropTypes.number,
  disabled: PropTypes.bool,
  selected: PropTypes.bool,
}

Icon.defaultProps = {
  size: 24,
  disabled: false,
  selected: false,
}

export default Icon
