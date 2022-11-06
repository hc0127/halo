import React from 'react'
import PropTypes from 'prop-types'
import DashboardButton from '../DashboardButton'
import { VARIANT } from '../../utils/constants'
import { confirmDialog } from '../../stores/ReduxStores/dashboard/dashboard'

const propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
}

const DialogConfirm = ({ title, message, buttonText, onClose, dispatch }) => (
  <div>
    <h2>{title}</h2>
    <p>{message}</p>

    <div className="dialog__button-bar">
      <DashboardButton onClick={onClose} variant={VARIANT.Secondary}>
        Cancel
      </DashboardButton>
      <DashboardButton
        onClick={() => {
          dispatch(confirmDialog(true))
        }}
      >
        {buttonText}
      </DashboardButton>
    </div>
  </div>
)

DialogConfirm.propTypes = propTypes

DialogConfirm.defaultProps = {
  buttonText: 'Confirm',
}

export default DialogConfirm
