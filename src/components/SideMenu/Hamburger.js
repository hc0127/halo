import React from 'react'
import PropTypes from 'prop-types'

const Hamburger = ({ type, onClick, active }) => (
  <button
    onClick={onClick}
    className={`${'hamburger hamburger--'}${type}${active ? ' is-active' : ''}`}
    type="button"
  >
    <span className="hamburger-box">
      <span className="hamburger-inner" />
    </span>
  </button>
)

Hamburger.propTypes = {
  type: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
}

export default Hamburger
