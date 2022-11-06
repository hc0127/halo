import React from 'react'
import PropTypes from 'prop-types'

const propTypes = { children: PropTypes.node.isRequired }

const Card = ({ children }) => (
  <div className="card">
    <div className="card__container">{children}</div>
  </div>
)

Card.propTypes = propTypes

Card.defaultProps = {}

export default Card
