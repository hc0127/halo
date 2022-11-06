import React from 'react'
import PropTypes from 'prop-types'

const TextInputItem = ({
  value,
  name,
  type,
  label,
  containerStyles,
  ...rest
}) => {
  return (
    <div className="text-input-item" style={containerStyles}>
      <p>{label}</p>
      <input type={type} value={value} name={name} {...rest} />
    </div>
  )
}

TextInputItem.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  label: PropTypes.string,
  containerStyles: PropTypes.object,
}

TextInputItem.defaultProps = {
  value: '',
  name: null,
  type: 'text',
  label: 'Label',
  containerStyles: {},
}

export default TextInputItem
