import React from 'react'
import PropTypes from 'prop-types'
import { Overlay } from '../'

const onClickFunc = () => {
  console.log('clicked')
}

const GDPRPopupView = ({ child, open }) => (
  <section
    className={`GDPRPopupView ${open ? 'GDPRPopupView--open' : 'GDPRPopupView--closed'}`}
  >
    <Overlay opacity={0.8} color="black" onClick={onClickFunc()}/>
    <div className="GDPRPopupView__popup">{open && child && child}</div>
  </section>
)

GDPRPopupView.propTypes = {
  child: PropTypes.node,
  open: PropTypes.bool.isRequired,
}

GDPRPopupView.defaultProps = {
  child: <p> Nothing to see here </p>,
}

export default GDPRPopupView
