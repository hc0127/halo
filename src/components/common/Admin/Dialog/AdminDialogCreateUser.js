import React from 'react'
import AdminUserDetailPage from '../../../../containers/admin/AdminUserDetailPage'

const propTypes = {}

const AdminDialogCreateUser = ({ ...props }) => (
  <div>
    <AdminUserDetailPage
      newUser
      isDialog
      {...props}
      match={{ params: { id: null } }}
    />
  </div>
)

AdminDialogCreateUser.propTypes = propTypes

AdminDialogCreateUser.defaultProps = {}

export default AdminDialogCreateUser
