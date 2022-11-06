import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node.isRequired,
}

const AdminTabContent = ({ children }) => (
  <div className="admin-tab-content">{children}</div>
)

AdminTabContent.propTypes = propTypes

export default AdminTabContent
