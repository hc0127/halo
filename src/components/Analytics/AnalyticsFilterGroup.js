import React, { useState } from 'react'
import PropTypes from 'prop-types'
import AnalyticsFilterTitle from './AnalyticsFilterTitle'

import utils from '../../utils/helpers'

const propTypes = {
  children: PropTypes.node.isRequired,
}

const AnalyticsFilterGroup = ({ children }) => {
  const [open, setOpen] = useState(false)

  const arrayedChildren = React.Children.toArray(children)

  const title = arrayedChildren.find(
    child => child.type === AnalyticsFilterTitle,
  )

  const others = arrayedChildren.filter(
    child => child.type !== AnalyticsFilterTitle,
  )

  return (
    <div
      className={utils.makeClass(
        'analytics-filters__group',
        open ? 'open' : 'closed',
      )}
    >
      {React.cloneElement(title, {
        open,
        onClick: () => setOpen(!open),
      })}
      {<div className="analytics-filters__group__content">{others}</div>}
    </div>
  )
}

AnalyticsFilterGroup.propTypes = propTypes

AnalyticsFilterGroup.defaultProps = {}

export default AnalyticsFilterGroup
