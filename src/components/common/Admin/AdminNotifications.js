import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'

import { closeNotification } from '../../../stores/ReduxStores/admin/admin'
import AdminNotification from './AdminNotification'

const propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({ message: PropTypes.string }),
  ).isRequired,
  dispatch: PropTypes.func.isRequired,
}

const AdminNotifications = ({ notifications, dispatch }) => (
  <>
    {notifications.map((notification, index) => (
      <AdminNotification
        // this is fine because we use index as an id in the notification list
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        message={notification.message}
        bottom={index * 77}
        onClose={() => dispatch(closeNotification(index))}
      />
    ))}
  </>
)

AdminNotifications.propTypes = propTypes

AdminNotifications.defaultProps = {}

export default compose(
  connect(state => ({ notifications: state.admin.notifications })),
)(AdminNotifications)
