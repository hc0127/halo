import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.string.isRequired,
  open: PropTypes.bool,
}

const DashboardPanel = ({ children, type, open }) => (
  <div
    className={`dashboard-page__panel dashboard-page__panel--${type} ${
      open ? `dashboard-page__panel--${type}--open` : ''
    }`}
  >
    {children}
  </div>
)

DashboardPanel.propTypes = propTypes

DashboardPanel.defaultProps = { open: false }

export default DashboardPanel
