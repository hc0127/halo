import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node.isRequired,
  thin: PropTypes.bool,
  nopadding: PropTypes.bool,
}
const AdminCardBody = ({ children, thin, nopadding }) => (
  <div
    className={`admin-card__body ${thin ? 'admin-card__body--thin' : ''} ${
      nopadding ? 'admin-card__body--no-padding' : ''
    }`}
  >
    {children}
  </div>
)

AdminCardBody.propTypes = propTypes

AdminCardBody.defaultProps = { thin: false, nopadding: false }

export default AdminCardBody
