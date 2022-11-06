import React from 'react'
import PropTypes from 'prop-types'
import VenueCheckListItem from './VenueCheckListItem'

const propTypes = {
  checks: PropTypes.array,
  date: PropTypes.object.isRequired,
}

const VenueCheckListGroup = ({ checks, date }) => (
  <tbody className="venue-check-list__table__group">
    <tr className="venue-check-list__table__group__header">
      <td colSpan="5">
        <span className="venue-check-list__table__group__header__name">
          {date.format('dddd Do MMMM YYYY')}
        </span>
      </td>
    </tr>
    {checks.map(check => (
      <VenueCheckListItem key={check.object_id} check={check} />
    ))}
  </tbody>
)

VenueCheckListGroup.propTypes = propTypes

VenueCheckListGroup.defaultProps = {
  checks: [],
}

export default VenueCheckListGroup
