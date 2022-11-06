import React from 'react'
import PropTypes from 'prop-types'

const View = ({ children, className }) => (
  <section className={`View ${className}`}>{children}</section>
)

View.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

View.defaultProps = {
  className: '',
}

export default View
