import React from 'react'
import PropTypes from 'prop-types'

const Icon = ({
  src,
  size,
  borderRadius,
  backgroundColor,
  children,
  margin,
  style,
}) => {
  const styles = {
    backgroundColor,
    backgroundImage: `url(${src})`,
    height: `${size}px`,
    width: `${size}px`,
    borderRadius,
    display: children ? 'flex' : '',
    justifyContent: children ? 'center' : '',
    alignItems: children ? 'center' : '',
    margin,
    ...style,
  }

  return (
    <div className="Icon" style={styles}>
      {children && children}
    </div>
  )
}

Icon.propTypes = {
  src: PropTypes.string.isRequired,
  size: PropTypes.number,
  borderRadius: PropTypes.string,
  backgroundColor: PropTypes.string,
  children: PropTypes.node,
  margin: PropTypes.string,
}

Icon.defaultProps = {
  size: 25,
  borderRadius: '',
  backgroundColor: '',
  children: null,
  margin: '0',
}

export default Icon
