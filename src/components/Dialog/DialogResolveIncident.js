import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { useSelector } from 'react-redux'
import debounce from 'lodash.debounce'

import {
  resolveIncidentAction,
  archiveIncident,
} from '../../stores/ReduxStores/dashboard/incidents'
import DashboardButton from './../DashboardButton'

const propTypes = {
  onClose: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  incident: PropTypes.instanceOf(Parse.Object).isRequired,
}

const DialogResolveIncident = ({ onClose, dispatch, incident }) => {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const textAreaRef = useRef(null)

  const resolveVariation = useSelector(state => state.dialog.resolveVariation)
  const isAnalyticsPage = useSelector(state => state.dashboard.dialogProps)

  useEffect(() => {
    if (!(document.activeElement === textAreaRef.current)) {
      textAreaRef.current.focus()
    }

    return () => {
      textAreaRef.current.blur()
    }
  }, [])

  return (
    <div className="dialog-resolve-incident">
      <div>{`Resolve Incident ${incident.incident_code}`}</div>
      <div>
        <textarea
          autoFocus /* eslint-disable-line */
          ref={textAreaRef}
          placeholder="Resolution details"
          className="dialog-resolve-incident__textarea"
          value={message}
          onChange={e => setMessage(e.target.value)}
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
            dispatch(resolveIncidentAction(incident, message))

            if (resolveVariation === 'resolve_and_close') {
              debounce(
                () =>
                  dispatch(
                    archiveIncident(
                      incident,
                      'Resolved and Closed',
                      false,
                      true,
                    ),
                  ),
                100,
              )()
            }
          }}
        >
          Resolve
        </DashboardButton>
      </div>
    </div>
  )
}

DialogResolveIncident.propTypes = propTypes

export default DialogResolveIncident
