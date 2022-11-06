import React from 'react'
import PropTypes from 'prop-types'
import AdminSidebar from '../../AdminSidebar'
import { AdminDialog } from '../../common/Admin'
import AdminLoadingOverlay from '../../common/Admin/AdminLoadingOverlay'
import AdminNotifications from '../../common/Admin/AdminNotifications'
import AdminMainView from '../../AdminMainView'

const LayoutAdmin = ({ children }) => (
  <>
    <AdminSidebar />
    <AdminDialog />
    <AdminLoadingOverlay />
    <AdminNotifications />
    <AdminMainView>{children}</AdminMainView>
  </>
)

LayoutAdmin.propTypes = {
  children: PropTypes.node.isRequired,
}

export default LayoutAdmin
