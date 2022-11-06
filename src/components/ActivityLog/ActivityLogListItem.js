import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import PropTypes from 'prop-types'
import Parse from 'parse'
import moment from 'moment'

import utils from '../../utils/helpers'
import ActivityLogIncidentIcon from './ActivityLogIncidentIcon'
import { openIncidentView } from '../../stores/ReduxStores/dashboard/dashboard'

const propTypes = {
  log: PropTypes.instanceOf(Parse.Object).isRequired,
  dispatch: PropTypes.func.isRequired,
}

const ActivityLogListItem = ({ log, dispatch }) => {
  const { user } = log

  const onIncidentClick = () => {
    if (!!log.incident.object_id) {
      dispatch(openIncidentView(log.incident.object_id))
    }
  }

  return (
    <tr className="activity-logs__list-item" onClick={onIncidentClick}>
      <td className="activity-logs__list-item__time">
        {log.created_at && moment(log.created_at).format('DD/MM/YY HH:mm')}
      </td>
      <td
        className="activity-logs__list-item__description"
        style={{ whiteSpace: 'pre-line' }}
      >
        {log.log_message}
      </td>
      <td className="activity-logs__list-item__name">{user && user.name}</td>
      {/* TODO replace with new ICON component when developed */}
      <td>
        {log.incident && <ActivityLogIncidentIcon incident={log.incident} />}
      </td>
      <td className="activity-logs__list-item__type">
        {utils.makeReadable(log.log_type)}
      </td>
    </tr>
  )
}

ActivityLogListItem.propTypes = propTypes

ActivityLogListItem.defaultProps = {}

export default compose(connect())(ActivityLogListItem)
