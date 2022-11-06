import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node,
  size: PropTypes.number,
}

const AdminFormColumn = ({ children, size }) => (
  <div className="admin-form__column" style={{ flexGrow: size }}>
    {children}
  </div>
)

AdminFormColumn.propTypes = propTypes
AdminFormColumn.defaultProps = {
  size: 1,
  children: null,
}

export default AdminFormColumn
