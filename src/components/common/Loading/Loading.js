import React from 'react'
import PropTypes from 'prop-types'
import utils from './../../../utils/helpers'

const Loading = ({ centered }) => (
  <svg
    version="1.1"
    id="L4"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 52 12"
    enableBackground="new 0 0 0 0"
    xmlSpace="preserve"
    className={utils.makeClass('Loading', centered && 'centered')}
  >
    <circle stroke="none" cx="6" cy="6" r="6">
      <animate
        attributeName="opacity"
        dur="1s"
        values="0;1;0"
        repeatCount="indefinite"
        begin="0.1"
      />
    </circle>
    <circle stroke="none" cx="26" cy="6" r="6">
      <animate
        attributeName="opacity"
        dur="1s"
        values="0;1;0"
        repeatCount="indefinite"
        begin="0.2"
      />
    </circle>
    <circle stroke="none" cx="46" cy="6" r="6">
      <animate
        attributeName="opacity"
        dur="1s"
        values="0;1;0"
        repeatCount="indefinite"
        begin="0.3"
      />
    </circle>
  </svg>
)

Loading.propTypes = {
  centered: PropTypes.bool,
}

Loading.defaultProps = {
  centered: false,
}

export default Loading
