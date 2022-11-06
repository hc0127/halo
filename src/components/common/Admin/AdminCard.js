import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

const AdminCard = ({ title, className, children }) => (
  <div className={`admin-card ${className}`}>
    <div className={`admin-card__title ${className && `${className}__title`}`}>
      {title}
    </div>
    <div
      className={`admin-card__content ${className && `${className}__content`}`}
    >
      {children}
    </div>
  </div>
)

AdminCard.propTypes = propTypes

AdminCard.defaultProps = {
  className: '',
  title: '',
}

export default AdminCard
