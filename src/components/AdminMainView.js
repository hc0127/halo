import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node.isRequired,
}

const AdminMainView = ({ children }) => (
  <div className="admin-main-view">{children}</div>
)

AdminMainView.propTypes = propTypes

AdminMainView.defaultProps = {}

export default AdminMainView
