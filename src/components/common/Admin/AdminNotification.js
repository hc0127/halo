import React from 'react'
import PropTypes from 'prop-types'

import AdminButton from './AdminButton'

import { VARIANT } from '../../../utils/constants'
import { useAnimation, easing } from '../../../utils/customHooks'

const propTypes = {
  message: PropTypes.string.isRequired,
  bottom: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
}

const AdminNotification = ({ message, bottom, onClose }) => {
  const animation = useAnimation(easing.outExpo, 500, 0)
  return (
    <div className="admin-notification" style={{ bottom, opacity: animation }}>
      <div className="admin-notification__message">{message}</div>
      <AdminButton variant={VARIANT.NoBackground} onClick={() => onClose()}>
        &times;
      </AdminButton>
    </div>
  )
}
AdminNotification.propTypes = propTypes

AdminNotification.defaultProps = {}

export default AdminNotification
