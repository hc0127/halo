import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { useSelector } from 'react-redux'

import DashboardButton from '../DashboardButton'
import { archiveIncident } from '../../stores/ReduxStores/dashboard/incidents'

const propTypes = {
  onClose: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  incident: PropTypes.instanceOf(Parse.Object).isRequired,
  isAnalyticsPage: PropTypes.bool,
}

const DialogArchiveIncident = ({
  onClose,
  dispatch,
  incident,
  isAnalyticsPage,
}) => {
  const [message, setMessage] = useState('')
  const [debrief, setDebrief] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const state = useSelector(state => state)

  useEffect(() => {
    console.log('STATE', state)
  }, [state])

  return (
    <div className="dialog-archive-incident">
      <div>{`Close Incident ${incident.incident_code}`}</div>
      <div>
        <textarea
          autoFocus /* eslint-disable-line */
          placeholder="Notes"
          className="dialog-archive-incident__textarea"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>
      <div className="dialog-archive-incident__debrief">
        Add to debrief?
        <input
          type="checkbox"
          onChange={e => {
            setDebrief(e.target.checked)
          }}
          checked={debrief}
        />
      </div>
      <div className="dialog__button-bar">
        <DashboardButton variant="secondary" onClick={onClose}>
          Cancel
        </DashboardButton>
        <DashboardButton
          disabled={!message || submitting}
          onClick={() => {
            setSubmitting(true)
            dispatch(
              archiveIncident(incident, message, debrief, isAnalyticsPage),
            )
          }}
        >
          Close
        </DashboardButton>
      </div>
    </div>
  )
}

DialogArchiveIncident.propTypes = propTypes

DialogArchiveIncident.defaultProps = {
  isAnalyticsPage: false,
}

export default DialogArchiveIncident
