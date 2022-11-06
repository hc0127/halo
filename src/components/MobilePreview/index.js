import React from 'react'
import PropTypes from 'prop-types'

const MobilePreview = ({ logo }) => {
  return (
    <div className="mobile-preview">
      <h3>Mobile Preview</h3>
      <div className="mobile-preview__mobile-preview-container">
        <div className="mobile-preview__mobile-preview-container__logo-container">
          {logo && <img src={logo} alt="Client Logo" />}
        </div>
      </div>
    </div>
  )
}

MobilePreview.propTypes = {
  logo: PropTypes.string.isRequired,
}

export default MobilePreview
