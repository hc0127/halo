import React, { useEffect } from 'react'
import Parse from 'parse'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import { loadStaff } from '../../stores/ReduxStores/dashboard/staff'
import {
  toggleChecksComplete,
  completeChecks,
} from '../../stores/ReduxStores/dashboard/eventChecks'
import VenueCheckListGroup from './VenueCheckListGroup'
import utils from '../../utils/helpers'
import AdminButton from '../../components/common/Admin/AdminButton'
import NiceCheckbox from '../../components/AdminTable/NiceCheckbox'

const propTypes = {
  checks: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)),
  dispatch: PropTypes.func.isRequired,
  traverseChecks: PropTypes.func.isRequired,
  isPrevPaginationDisabled: PropTypes.bool.isRequired,
  isNextPaginationDisabled: PropTypes.bool.isRequired,
}

const VenueCheckList = ({
  checks,
  dispatch,
  traverseChecks,
  isPrevPaginationDisabled,
  isNextPaginationDisabled,
}) => {
  useEffect(() => {
    dispatch(loadStaff())
  }, [dispatch])

  const groupedChecks = utils.groupItemsBy(checks, check =>
    moment
      .utc(check.occurs_at)
      .startOf('day')
      .format(),
  )

  const isChecksMarked = checks.some(({ isChecked }) => isChecked)
  const isAllChecksComplete = checks.every(
    ({ status }) => status === 'complete',
  )

  return (
    <div className="venue-check-list">
      <div className="venue-check-list__buttonContainer">
        <AdminButton
          onClick={() => traverseChecks('prev')}
          disabled={isPrevPaginationDisabled}
        >
          Previous
        </AdminButton>
        <AdminButton
          disabled={!isChecksMarked}
          onClick={() => dispatch(completeChecks())}
          style={{ width: '150px' }}
        >
          Mark as completed
        </AdminButton>
        <AdminButton
          onClick={() => traverseChecks('next')}
          disabled={isNextPaginationDisabled}
        >
          Next
        </AdminButton>
      </div>
      <div className="venue-check-list__container">
        <table className="venue-check-list__table">
          <thead>
            <tr>
              <th>
                <NiceCheckbox
                  onChange={e => dispatch(toggleChecksComplete(e))}
                  disabled={isAllChecksComplete}
                />
              </th>
              <th />
              <th>Title</th>
              <th>Time</th>
              <th>Type</th>
              <th>Assignee</th>
              <th>Completed on time?</th>
            </tr>
          </thead>
          {checks.length
            ? Object.keys(groupedChecks).map(key => (
                <VenueCheckListGroup
                  key={key.toString()}
                  checks={groupedChecks[key]}
                  date={moment(key)}
                />
              ))
            : ''}
        </table>
        <br />
        <br />
      </div>
    </div>
  )
}

VenueCheckList.propTypes = propTypes

VenueCheckList.defaultProps = {
  checks: [],
}

export default connect(state => ({
  staff: state.staff.data,
  isNextPaginationDisabled:
    state.eventChecks.pagination.isNextPaginationDisabled,
  isPrevPaginationDisabled:
    state.eventChecks.pagination.isPrevPaginationDisabled,
}))(VenueCheckList)
