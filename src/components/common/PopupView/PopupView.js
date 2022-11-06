import React from 'react'
import PropTypes from 'prop-types'
//
import { Overlay } from '../'

const PopupView = ({ child, open, closePopup }) => (
  <section
    className={`PopupView ${open ? 'PopupView--open' : 'PopupView--closed'}`}
  >
    <Overlay opacity={0.8} color="black" onClick={closePopup} />
    <div className="PopupView__popup">{open && child && child}</div>
  </section>
)

PopupView.propTypes = {
  child: PropTypes.node,
  open: PropTypes.bool.isRequired,
  closePopup: PropTypes.func.isRequired,
}

PopupView.defaultProps = {
  child: <p> Nothing to see here </p>,
}

export default PopupView
