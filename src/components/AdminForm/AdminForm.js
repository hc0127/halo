import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node.isRequired,
}

const AdminForm = ({ children }) => <div className="admin-form">{children}</div>

AdminForm.propTypes = propTypes
AdminForm.defaultProps = {}

export default AdminForm
