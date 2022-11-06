import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DIALOG_TYPE } from '../../../utils/constants'
import {
  AdminDialogResetPassword,
  AdminDialogCreateUser,
  AdminDialogEditUser,
} from './Dialog'
import { closeDialog } from '../../../stores/ReduxStores/dialog'
import AdminDialogConfirm from './Dialog/AdminDialogConfirm'
import AdminDialogUploader from './Dialog/AdminDialogUploader'
import BeaconDialogAddorEdit from './Dialog/BeaconDialogAddorEdit'

const propTypes = {
  dialog: PropTypes.shape({
    type: PropTypes.oneOf(Object.values(DIALOG_TYPE)),
    open: PropTypes.bool.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
}

const AdminDialog = ({ dialog, dispatch }) => {
  let DialogComponent

  switch (dialog.type) {
    case DIALOG_TYPE.ResetPassword:
      DialogComponent = AdminDialogResetPassword
      break
    case DIALOG_TYPE.CreateUser:
      DialogComponent = AdminDialogCreateUser
      break
    case DIALOG_TYPE.Confirm:
      DialogComponent = AdminDialogConfirm
      break
    case DIALOG_TYPE.EditUser:
      DialogComponent = AdminDialogEditUser
      break
    case DIALOG_TYPE.Uploader:
      DialogComponent = AdminDialogUploader
      break
    case DIALOG_TYPE.AddBeacon:
      DialogComponent = BeaconDialogAddorEdit
      break
    default:
      DialogComponent = null
      break
  }

  const state = dialog.open ? 'open' : 'close'

  return (
    <>
      <div
        className={`admin-dialog admin-dialog--${state} admin-dialog--${dialog.type}`}
      >
        {DialogComponent && dialog.open && (
          <DialogComponent
            key={dialog.key} /* eslint-disable-line */
            onClose={() => dispatch(closeDialog())}
            {...dialog}
          />
        )}
      </div>
      <button
        className={`admin-dialog-overlay admin-dialog-overlay--${state}`}
        onClick={() => dispatch(closeDialog())}
      />
    </>
  )
}

AdminDialog.propTypes = propTypes

AdminDialog.defaultProps = {}

export default connect(state => ({
  dialog: state.dialog,
}))(AdminDialog)
