import React from 'react'
import PropTypes from 'prop-types'
import AdminButton from './AdminButton'

const propTypes = {
  message: PropTypes.string.isRequired,
  onReload: PropTypes.func.isRequired,
}

const AdminSaveConflictHandler = ({ message, onReload }) => (
  <div className="admin-save-panel-conflict-handler">
    <div className="admin-save-panel-conflict-handler__message">{message}</div>

    <AdminButton onClick={onReload}>Reload</AdminButton>
  </div>
)

AdminSaveConflictHandler.propTypes = propTypes

AdminSaveConflictHandler.defaultProps = {}

export default AdminSaveConflictHandler
