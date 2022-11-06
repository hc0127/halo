import React from 'react'
import PropTypes from 'prop-types'

const Card = ({ children, color, align, margin, padding }) => (
  <div
    className={`
    Card Card--${color}
    ${align === 'center' ? 'Card--centerAlign' : ''}
    ${margin ? `Card--margin-${margin}` : ''}
    ${padding ? `Card--padding-${padding}` : ''}
    `}
  >
    {children}
  </div>
)

Card.propTypes = {
  children: PropTypes.node,
  color: PropTypes.oneOf(['white', 'blue', 'red']),
  align: PropTypes.oneOf(['center', 'left', 'right']),
  margin: PropTypes.oneOf([undefined, '0', 'xs', 'sm', 'md', 'lg', 'xl']),
  padding: PropTypes.oneOf([undefined, '0', 'xs', 'sm', 'md', 'lg', 'xl']),
}

Card.defaultProps = {
  children: <span>Card</span>,
  color: 'white',
  align: 'left',
  margin: undefined,
  padding: 'md',
}

export default Card
