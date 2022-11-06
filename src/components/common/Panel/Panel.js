import React from 'react'
import PropTypes from 'prop-types'

const Panel = ({ children, size, height, orientation, maxWidth }) => {
  const styles = {
    height,
    display: 'flex',
    flexGrow: size,
    flexDirection: orientation,
    maxWidth,
  }
  return (
    <div className="Panel" style={styles}>
      {children}
    </div>
  )
}

Panel.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.number,
  orientation: PropTypes.oneOf(['column', 'row']),
  height: PropTypes.oneOf(['100%', 'auto', '50%']),
  maxWidth: PropTypes.oneOf(['50vw', '25vw', 'auto']),
}

Panel.defaultProps = {
  size: 2,
  orientation: 'row',
  height: 'auto',
  maxWidth: 'auto',
}

export default Panel
