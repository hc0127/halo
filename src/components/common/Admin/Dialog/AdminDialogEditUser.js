import React from 'react'
import PropTypes from 'prop-types'
import AdminUserDetailPage from '../../../../containers/admin/AdminUserDetailPage'

const propTypes = {
  userId: PropTypes.string.isRequired,
}

const AdminDialogEditUser = ({ userId, ...props }) => (
  <div>
    <AdminUserDetailPage
      isDialog
      {...props}
      match={{ params: { id: userId } }}
    />
  </div>
)

AdminDialogEditUser.propTypes = propTypes

AdminDialogEditUser.defaultProps = {}

export default AdminDialogEditUser
