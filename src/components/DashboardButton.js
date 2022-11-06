import React from 'react'
import PropTypes from 'prop-types'
import { VARIANT } from '../utils/constants'
import Loading from './common/Loading/Loading'

const propTypes = {
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(Object.values(VARIANT)),
}

const DashboardButton = ({
  variant,
  loading,
  children,
  disabled,
  ...props
}) => (
  <button
    className={`dashboard-button dashboard-button--${variant}`}
    {...props}
    disabled={loading || disabled}
  >
    {loading ? <Loading /> : children}
  </button>
)

DashboardButton.propTypes = propTypes

DashboardButton.defaultProps = {
  disabled: false,
  loading: false,
  variant: VARIANT.Primary,
}

export default DashboardButton
