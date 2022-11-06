import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import moment from 'moment'
import DashboardCheckListItem from './DashboardCheckListItem'

const propTypes = {
  checks: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)),
  date: PropTypes.instanceOf(moment).isRequired,
}

const DashboardCheckGroup = ({ checks, date }) => (
  <div className="check-list__group">
    <div className="check-list__group__header">
      <span className="check-list__group__header__name">
        {date.format('dddd Do MMMM YYYY')}
      </span>
    </div>
    <div className="check-list__items">
      {checks.map(check => (
        <DashboardCheckListItem key={check.id} check={check} />
      ))}
    </div>
  </div>
)

DashboardCheckGroup.propTypes = propTypes

DashboardCheckGroup.defaultProps = {
  checks: [],
}

export default DashboardCheckGroup
