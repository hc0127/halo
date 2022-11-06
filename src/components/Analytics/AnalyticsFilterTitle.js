import React from 'react'
import PropTypes from 'prop-types'

import filterDown from '../../images/analytics-filter-down.svg'
import filterUp from '../../images/analytics-filter-up.svg'

import ClickableDiv from '../ClickableDiv'

const propTypes = {
  children: PropTypes.node.isRequired,
  open: PropTypes.bool,
  onClick: PropTypes.func,
}

const AnalyticsFilterTitle = ({ children, open, onClick }) => (
  <ClickableDiv className="analytics-filters__title" onClick={onClick}>
    <div>{children}</div>
    <div>
      <img src={open ? filterDown : filterUp} alt="" />
    </div>
  </ClickableDiv>
)

AnalyticsFilterTitle.propTypes = propTypes

AnalyticsFilterTitle.defaultProps = {
  open: false,
  onClick: () => {},
}

export default AnalyticsFilterTitle
