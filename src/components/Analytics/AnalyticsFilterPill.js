import React from 'react'
import PropTypes from 'prop-types'
import ClickableDiv from '../ClickableDiv'

const propTypes = {
  onRemove: PropTypes.func.isRequired,
  children: PropTypes.string.isRequired,
}

const AnalyticsFilterPill = ({ onRemove, children }) => (
  <div className="analytics-filters__pill">
    <span>{children}</span>
    <ClickableDiv onClick={onRemove}>&times;</ClickableDiv>
  </div>
)

AnalyticsFilterPill.propTypes = propTypes

AnalyticsFilterPill.defaultProps = {}

export default AnalyticsFilterPill
