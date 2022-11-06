import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import Lightbox from 'react-image-lightbox';
import Button from '../Button/Button'

let Lightbox = {}
if (typeof window !== 'undefined') {
  Lightbox = require('react-image-lightbox').default
}

export default class Image extends Component {
  constructor() {
    super()
    this.state = { isLightboxOpen: false }
  }
  render() {
    const { src, alt, ...otherProps } = this.props

    return (
      <div className="Image">
        <Button
          onClick={() => this.setState({ isLightboxOpen: true })}
          type="invisible"
        >
          <img src={src} alt={alt} {...otherProps} />
        </Button>
        {this.state.isLightboxOpen && (
          <Lightbox
            mainSrc={src}
            onCloseRequest={() => this.setState({ isLightboxOpen: false })}
          />
        )}
      </div>
    )
  }
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
}
