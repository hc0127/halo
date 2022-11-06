import React from 'react'
import PropTypes from 'prop-types'
import { VARIANT } from '../../../utils/constants'

const propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(Object.values(VARIANT)).isRequired,
}
const AdminSwitch = ({ label, value, onChange, disabled, variant }) => (
  <div
    className={`admin-switch admin-switch--${variant} ${
      disabled ? 'admin-switch--disabled' : ''
    }`}
  >
    <label className="admin-switch__nice-switch">
      <input
        type="checkbox"
        className="admin-switch__field"
        checked={value}
        onChange={e => (disabled ? null : onChange(e.target.checked))}
      />
      <span className="admin-switch__css-switch" />
    </label>
    <label>{label}</label>
  </div>
)

AdminSwitch.propTypes = propTypes

AdminSwitch.defaultProps = {
  disabled: false,
}

export default AdminSwitch
