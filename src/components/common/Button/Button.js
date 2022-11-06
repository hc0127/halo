import React from 'react'
import PropTypes from 'prop-types'

const Button = ({
  children,
  onClick,
  type,
  margin,
  size,
  disabled,
  style,
  className,
  ...props
}) => {
  const styles = {
    margin,
    ...style,
  }
  return (
    <button
      className={`Button Button--${type} Button--${size} ${className}`}
      onClick={onClick}
      style={styles}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf([
    'invisible',
    'primary',
    'outline',
    'secondary',
    'close',
  ]),
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.string,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
}

Button.defaultProps = {
  children: <span>Click me</span>,
  type: 'primary',
  margin: '0',
  size: 'np',
  onClick: () => {},
  disabled: false,
  style: {},
  className: '',
}

export default Button
