import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node.isRequired,
  inDialog: PropTypes.bool,
}

const AdminSavePanel = ({ children, inDialog }) => (
  <div
    className={`admin-save-panel ${inDialog ? 'admin-save-panel--dialog' : ''}`}
  >
    {children}
  </div>
)

AdminSavePanel.propTypes = propTypes

AdminSavePanel.defaultProps = {
  inDialog: false,
}

export default AdminSavePanel
