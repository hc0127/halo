import React from 'react'
import PropTypes from 'prop-types'

const Heading = ({ text, size, color, underlined, margin, className }) => {
  const styles = {
    margin,
  }
  let tag
  switch (size) {
    case 'h1':
      tag = (
        <h1 style={styles} className={`Heading--${color} ${className}`}>
          {text}
        </h1>
      )
      break
    case 'h2':
      tag = (
        <h2 style={styles} className={`Heading--${color} ${className}`}>
          {text}
        </h2>
      )
      break
    case 'h3':
      tag = (
        <h3 style={styles} className={`Heading--${color} ${className}`}>
          {text}
        </h3>
      )
      break
    case 'h4':
      tag = (
        <h4 style={styles} className={`Heading--${color} ${className}`}>
          {text}
        </h4>
      )
      break
    default:
      tag = (
        <h1 style={styles} className={`Heading--${color} ${className}`}>
          {text}
        </h1>
      )
      break
  }
  return underlined ? <u>{tag}</u> : tag
}

Heading.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  size: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4']),
  color: PropTypes.oneOf(['white', 'black', 'blue', 'blue-dark']),
  underlined: PropTypes.bool,
  margin: PropTypes.string,
  className: PropTypes.string.isRequired,
}

Heading.defaultProps = {
  color: 'black',
  size: 'h2',
  underlined: false,
  margin: '0',
}

export default Heading
