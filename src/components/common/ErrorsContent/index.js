import React from 'react'
import PropTypes from 'prop-types'

const ErrorsContent = ({ content }) => {
  return <p className="errors-content">{content}</p>
}

ErrorsContent.propTypes = {
  content: PropTypes.string,
}

ErrorsContent.defaultProps = {
  content: '',
}

export default ErrorsContent
