import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Parse from 'parse'

import { AdminCardBody, AdminLimitCard } from '.'
import { withUserContext } from '../../../Contexts'
import { USER_PERMISSIONS } from '../../../utils/constants'

const propTypes = {
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
  eventCount: PropTypes.number.isRequired,
  staffCount: PropTypes.number.isRequired,
}

const AdminClientLimitDisplay = ({ currentUser, eventCount, staffCount }) =>
  currentUser.permission_role === USER_PERMISSIONS.ClientManager && (
    <div className="admin-client-limit-display">
      <AdminCardBody thin>
        <AdminLimitCard title="Events">
          {eventCount}/{currentUser.client.event_limit || '-'}
        </AdminLimitCard>
      </AdminCardBody>
      <AdminCardBody thin>
        <AdminLimitCard title="People">
          {staffCount}/{currentUser.client.staff_limit || '-'}
        </AdminLimitCard>
      </AdminCardBody>
    </div>
  )

AdminClientLimitDisplay.propTypes = propTypes

AdminClientLimitDisplay.defaultProps = {}

export default compose(
  withUserContext,
  connect(state => ({
    eventCount: Object.keys(state.events.data).length,
    staffCount: state.users.count,
  })),
)(AdminClientLimitDisplay)
