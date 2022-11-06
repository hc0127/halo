import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import moment from 'moment'

import ActivityLogListItem from './ActivityLogListItem'
import utils from '../../utils/helpers'

const propTypes = {
  logs: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  header: PropTypes.instanceOf(moment).isRequired,
}

const ActivityLogGroup = ({ logs, header }) => (
  <tbody>
    {utils
      .sort(logs, log => log.createdAt, 'desc')
      .map(log => (
        <ActivityLogListItem log={log} key={log.id} />
      ))}
  </tbody>
)

ActivityLogGroup.propTypes = propTypes

export default ActivityLogGroup
