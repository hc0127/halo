import React from 'react'
import PropTypes from 'prop-types'

const ActivityLogMessage = ({ logText, incidentCode, onClick }) => {
  return (
    <p>
      {logText}
      <span
        className="activity-logs__log_message_btn"
        onClick={onClick(incidentCode.trim())}
      >
        {incidentCode}
      </span>
    </p>
  )
}

ActivityLogMessage.propTypes = {
  logText: PropTypes.string,
  incidentCode: PropTypes.string,
  onClick: PropTypes,
}

ActivityLogMessage.defaultProps = {
  logText: '',
  incidentCode: '',
  onClick: () => {},
}

export default ActivityLogMessage
