import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import AdminField from '../AdminField'
import { AdminButton, AdminTitle } from '..'
import {
  confirmDialog,
  closeDialog,
} from '../../../../stores/ReduxStores/dialog'
import { VARIANT } from '../../../../utils/constants'

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  message: PropTypes.string,
  title: PropTypes.string.isRequired,
  buttonTextConfirm: PropTypes.string.isRequired,
  buttonTextCancel: PropTypes.string,
  dates: PropTypes.object,
}

const AdminEventDates = ({ eventDates, setEventDates }) => {
  return (
    <div style={{ width: '500px' }}>
      <AdminField
        type="date"
        label="Start date"
        value={eventDates.start}
        onChange={val =>
          setEventDates(prevState => ({ ...prevState, start: val }))
        }
      />
      <AdminField
        type="date"
        label="End date"
        value={eventDates.end}
        onChange={val =>
          setEventDates(prevState => ({ ...prevState, end: val }))
        }
      />
    </div>
  )
}

const AdminDialogConfirm = ({
  dispatch,
  message,
  title,
  buttonTextConfirm,
  buttonTextCancel,
  dates,
}) => {
  const [eventDates, setEventDates] = useState({
    start: dates.startDate,
    end: dates.endDate,
  })
  const hasDates = Object.keys(dates).length
  const vals = hasDates ? eventDates : true
  const cancelAction = hasDates ? closeDialog() : confirmDialog(false)

  return (
    <Fragment>
      <AdminTitle>{title}</AdminTitle>
      {hasDates ? (
        <AdminEventDates
          eventDates={eventDates}
          setEventDates={setEventDates}
        />
      ) : (
        message
      )}
      <div className="button-panel">
        <AdminButton hollow onClick={() => dispatch(cancelAction)}>
          {buttonTextCancel}
        </AdminButton>
        <AdminButton
          variant={VARIANT.Secondary}
          onClick={() => dispatch(confirmDialog(vals))}
        >
          {buttonTextConfirm}
        </AdminButton>
      </div>
    </Fragment>
  )
}

AdminDialogConfirm.propTypes = propTypes

AdminDialogConfirm.defaultProps = {
  buttonTextCancel: 'Cancel',
  dates: {},
  message: '',
}

AdminEventDates.propTypes = {
  eventDates: PropTypes.object.isRequired,
  setEventDates: PropTypes.func.isRequired,
}

export default connect()(AdminDialogConfirm)
