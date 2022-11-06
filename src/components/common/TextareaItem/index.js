import React from 'react'
import PropTypes from 'prop-types'

const TextAreaItem = ({ label, containerStyles, ...rest }) => {
  return (
    <div className="text-area-item" style={containerStyles}>
      <p>{label}</p>
      <textarea {...rest}></textarea>
    </div>
  )
}

TextAreaItem.propTypes = {
  label: PropTypes.string,
  containerStyles: PropTypes.object,
}

TextAreaItem.defaultProps = {
  label: 'Label',
  containerStyles: {},
}

export default TextAreaItem
