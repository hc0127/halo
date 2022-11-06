import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isBordered: PropTypes.bool,
}

const AdminLimitCard = ({ title, children, isBordered }) => (
  <div className="admin-limit-card">
    <div className="admin-limit-card__title">{title}</div>
    <div
      className={`admin-limit-card__content ${isBordered ? 'bordered' : ''}`}
    >
      {children}
    </div>
  </div>
)

AdminLimitCard.propTypes = propTypes

AdminLimitCard.defaultProps = {
  isBordered: false,
}

export default AdminLimitCard
