import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DIALOG_TYPE } from '../utils/constants'
import { closeDialog } from '../stores/ReduxStores/dashboard/dashboard'
import DialogAddActivityLog from './Dialog/DialogAddActivityLog'
import DialogResolveIncident from './Dialog/DialogResolveIncident'
import DialogArchiveIncident from './Dialog/DialogArchiveIncident'
import DialogShareIncident from './Dialog/DialogShareIncident'
import DialogEvacuateSite from './Dialog/DialogEvacuateSite'
import DialogLockdownZone from './Dialog/DialogLockdownZone'
import DialogSendNotification from './Dialog/DialogSendNotification'
import DialogConfirm from './Dialog/DialogConfirm'
import DialogAssignUserToCheck from './Dialog/DialogAssignUserToCheck'
import DialogComment from './Dialog/DialogComment'

const propTypes = {
  dialogType: PropTypes.string.isRequired,
  dialogProps: PropTypes.object.isRequired,
  dialogKey: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
}

const Dialog = ({ dialogType, dialogProps, dialogKey, dispatch }) => {
  let DialogComponent

  switch (dialogType) {
    case DIALOG_TYPE.AddActivityLog:
      DialogComponent = DialogAddActivityLog
      break

    case DIALOG_TYPE.ResolveIncident:
      DialogComponent = DialogResolveIncident
      break

    case DIALOG_TYPE.ArchiveIncident:
      DialogComponent = DialogArchiveIncident
      break

    case DIALOG_TYPE.ShareIncident:
      DialogComponent = DialogShareIncident
      break

    // new ones
    case DIALOG_TYPE.EvacuateSite:
      DialogComponent = DialogEvacuateSite
      break

    case DIALOG_TYPE.LockdownZone:
      DialogComponent = DialogLockdownZone
      break

    case DIALOG_TYPE.SendNotification:
      DialogComponent = DialogSendNotification
      break

    case DIALOG_TYPE.AssignUserToCheck:
      DialogComponent = DialogAssignUserToCheck
      break

    case DIALOG_TYPE.Confirm:
      DialogComponent = DialogConfirm
      break

    case DIALOG_TYPE.Comment:
      DialogComponent = DialogComment
      break

    default:
      DialogComponent = null
      break
  }

  return (
    DialogComponent && (
      <DialogComponent
        {...dialogProps}
        key={dialogKey}
        onClose={() => dispatch(closeDialog())}
        dispatch={dispatch}
      />
    )
  )
}

Dialog.propTypes = propTypes

Dialog.defaultProps = {}

export default connect(state => ({
  dialogType: state.dashboard.dialogType,
  dialogProps: state.dashboard.dialogProps,
  dialogKey: state.dashboard.dialogKey,
}))(Dialog)
