import React from 'react'
import PropTypes from 'prop-types'

import { Button } from '../'

const Overlay = ({ opacity, color, onClick, zIndex, width }) => {
  const styles = {
    opacity,
    backgroundColor: color,
    zIndex,
    width,
  }

  return (
    <Button onClick={onClick} type="invisible">
      <div className="Overlay" style={styles} />
    </Button>
  )
}

Overlay.propTypes = {
  opacity: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  zIndex: PropTypes.string,
  width: PropTypes.string,
}

Overlay.defaultProps = {
  zIndex: '',
  width: '',
}

export default Overlay
