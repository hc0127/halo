import React from 'react'
import PropTypes from 'prop-types'

import Loading from '../Loading/Loading'
import { VARIANT } from '../../../utils/constants'

const propTypes = {
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(Object.values(VARIANT)),
  hollow: PropTypes.bool,
}

const AdminButton = ({
  children,
  loading,
  disabled,
  variant,
  hollow,
  ...props
}) => (
  <button
    className={`admin-button admin-button--${variant} ${
      hollow ? 'admin-button--hollow' : ''
    }`}
    {...props}
    disabled={loading || disabled}
  >
    {loading ? <Loading /> : children}
  </button>
)

AdminButton.propTypes = propTypes

AdminButton.defaultProps = {
  disabled: false,
  loading: false,
  variant: VARIANT.Primary,
  hollow: false,
}

export default AdminButton
