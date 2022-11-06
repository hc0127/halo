import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.string.isRequired,
}

const MobileNumber = ({ children }) => (
  <>
    <a href={`facetime:${children}`}>{children}</a>
    &nbsp;
  </>
)

MobileNumber.propTypes = propTypes

MobileNumber.defaultProps = {}

export default MobileNumber
