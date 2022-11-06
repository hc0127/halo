import React from 'react'
import PropTypes from 'prop-types'
import { BUTTON_ICONS } from '../../utils/constants'

import Icon from './Icon'

const propTypes = {
  children: PropTypes.node.isRequired,
}

const EventListButton = ({ children, ...props }) => (
  <button className="event-list-button" {...props}>
    {children}
    <Icon icon={BUTTON_ICONS.Dashboard} />
  </button>
)

EventListButton.propTypes = propTypes

EventListButton.defaultProps = {}

export default EventListButton
