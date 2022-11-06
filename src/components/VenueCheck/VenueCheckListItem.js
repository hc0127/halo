import React from 'react'
import Parse from 'parse'
import PropTypes from 'prop-types'
import { CHECK_TYPE_TEXT } from '../../utils/constants'
import { connect } from 'react-redux'
import moment from 'moment'
import { openEditCheckView } from '../../stores/ReduxStores/dashboard/dashboard'
import { toggleCheckComplete } from '../../stores/ReduxStores/dashboard/eventChecks'
import utils from '../../utils/helpers'
import { compose } from 'redux'
import { withUserContext } from '../../Contexts'

import NiceCheckbox from '../../components/AdminTable/NiceCheckbox'
import { Icon } from '../common'
import { getIcon } from '../../stores/IconStore'

const propTypes = {
  currentUser: PropTypes.instanceOf(Parse.Object).isRequired,
  check: PropTypes.instanceOf(Parse.Object),
  dispatch: PropTypes.func.isRequired,
  staff: PropTypes.array.isRequired,
}

const VenueCheckListItem = ({ currentUser, check, staff, dispatch }) => {
  const onClick = () => {
    dispatch(openEditCheckView(check.object_id))
  }

  const toggleCompleteHaloCheck = isChecked => {
    const { object_id: checkId } = check

    dispatch(toggleCheckComplete(checkId, isChecked))
  }

  const adminCheck = check.admin_check

  if (!adminCheck) {
    return null
  }

  const assignees = check.users.map(id => staff[id])
  const assigneesText = utils.getCheckAssigneesText(assignees)

  const status = utils.getEventCheckStatus(check)
  const isCompeletedOnTime = utils.isEventCompletedOnTime(check)
  const isUnseen = Boolean(utils.isEventCheckUnseen(check, currentUser))

  return (
    <tr className={utils.makeClass('venue-check-list__item', status)}>
      <td>
        {check.status !== 'complete' && (
          <NiceCheckbox
            onChange={e => toggleCompleteHaloCheck(e)}
            checked={check.isChecked}
          />
        )}
      </td>
      <td className="venue-check-list__alert">
        {isUnseen ? (
          <div className="venue-check-list__alert__icon">!</div>
        ) : null}
      </td>
      <button
        style={{
          background: 'none',
          border: 'none',
          textAlign: 'left',
        }}
        onClick={onClick}
      >
        <td className="venue-check-list__title">{adminCheck.title}</td>
      </button>
      <td className="venue-check-list__time">
        {moment.utc(check.occurs_at).time()}
      </td>
      <td className="venue-check-list__type">
        {CHECK_TYPE_TEXT[adminCheck.event_type]}
      </td>
      <td className="venue-check-list__assignees">{assigneesText}</td>
      <td>
        {isCompeletedOnTime === 'pending' ? (
          <div className={utils.makeClass('check-status', 'pending')} />
        ) : isCompeletedOnTime ? (
          <Icon src={getIcon('tickGreen')} size={30} />
        ) : (
          <Icon src={getIcon('crossRed')} size={25} />
        )}
      </td>
    </tr>
  )
}

VenueCheckListItem.propTypes = propTypes

VenueCheckListItem.defaultProps = {
  check: {},
}

export default compose(
  withUserContext,
  connect(state => ({ staff: state.staff.data })),
)(VenueCheckListItem)
