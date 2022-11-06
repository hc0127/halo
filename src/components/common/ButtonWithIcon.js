import React from 'react'
import PropTypes from 'prop-types'

import { BUTTON_ICONS, VARIANT } from '../../utils/constants'

import Icon from './Icon'

const getClassName = ({ title, variant, noBorder, wide, hollow }) =>
  `button-with-icon button-with-icon--${variant} 
  ${(noBorder && 'button-with-icon--no-border') || ''}
  ${(hollow && 'button-with-icon--hollow') || ''}
  ${(wide && 'button-with-icon--wide') || ''}
  ${(title === '' && 'button-with-icon--no-title') || ''}`

const ButtonWithIcon = ({
  title,
  icon,
  onClick,
  variant,
  disabled,
  noBorder,
  wide,
  selected,
  hollow,
}) => (
  <button
    className={getClassName({ title, variant, hollow, noBorder, wide })}
    onClick={disabled ? null : onClick}
    disabled={disabled}
    type="button"
  >
    <Icon icon={icon} disabled={disabled} selected={selected} />
    <span className="button-with-icon__text">{title}</span>
  </button>
)

ButtonWithIcon.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.oneOf(Object.values(BUTTON_ICONS)).isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(Object.values(VARIANT)),
  disabled: PropTypes.bool,
  wide: PropTypes.bool,
  selected: PropTypes.bool,
  noBorder: PropTypes.bool,
  hollow: PropTypes.bool,
}

ButtonWithIcon.defaultProps = {
  variant: VARIANT.Primary,
  disabled: false,
  title: '',
  wide: false,
  selected: false,
  noBorder: false,
  hollow: false,
}

export default ButtonWithIcon
