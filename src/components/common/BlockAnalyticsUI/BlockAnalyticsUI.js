import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const propTypes = {
  show: PropTypes.bool,
  zIndex: PropTypes.number.isRequired,
  opacity: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
}

const BlockUI = props => {
  const { zIndex, opacity, color, show } = props

  const styles = {
    zIndex: zIndex,
    opacity,
    backgroundColor: show ? color : 'transparent',
    display: show ? 'block' : 'none',
  }

  return <div className="blockui" style={styles} />
}

BlockUI.propTypes = propTypes

BlockUI.defaultProps = {
  show: false,
}

export default connect(state => ({
  show: !!state.dashboard.openedIncidentId,
}))(BlockUI)
