import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node.isRequired,
}

const AdminTitle = ({ children }) => <h1 className="admin-title">{children}</h1>

AdminTitle.propTypes = propTypes

export default AdminTitle
