import React from 'react'
import PropTypes from 'prop-types'
import { Overlay } from '../'

const onClickFunc = () => {
  console.log('clicked')
}

const GDPRFormikPopupView = ({ child, open }) => (
  <section
    className={`GDPRFormikPopupView ${open ? 'GDPRFormikPopupView--open' : 'GDPRFormikPopupView--closed'}`}
  >
    <Overlay opacity={0.8} color="black" onClick={onClickFunc()}/>
    <div className="GDPRFormikPopupView__popup">{open && child && child}</div>
  </section>
)

GDPRFormikPopupView.propTypes = {
  child: PropTypes.node,
  open: PropTypes.bool.isRequired,
}

GDPRFormikPopupView.defaultProps = {
  child: <p> Nothing to see here </p>,
}

export default GDPRFormikPopupView
