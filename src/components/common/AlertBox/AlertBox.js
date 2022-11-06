import React from 'react'
import PropTypes from 'prop-types'
import { ALERT_BOX_VARIANTS } from './../../../utils/constants'

const propTypes = {
  children: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(Object.values(ALERT_BOX_VARIANTS)),
  visible: PropTypes.bool.isRequired,
}

const AlertBox = ({ children, variant, visible }) => (
  <>
    {visible && (
      <div className={`alert-box alert-box--${variant} `}>{children}</div>
    )}
  </>
)

AlertBox.propTypes = propTypes

AlertBox.defaultProps = {
  variant: ALERT_BOX_VARIANTS.Danger,
}

export default AlertBox
