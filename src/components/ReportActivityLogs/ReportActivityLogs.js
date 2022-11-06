import React, { Component } from 'react'
import Parse from 'parse'
import PropTypes from 'prop-types'

import utils from '../../utils/helpers'

class ActivityLogs extends Component {
  static propTypes = {
    downloadPending: PropTypes.bool,
    logs: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)),
    onDownloadReport: PropTypes.func,
  }

  static defaultProps = {
    downloadPending: false,
    logs: [],
    onDownloadReport: () => {},
  }

  componentDidMount() {
    if (this.props.downloadPending) {
      this.props.onDownloadReport()
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.downloadPending === false) {
      return false
    }
    return true
  }

  render() {
    const { logs } = this.props
    return (
      <div className="ActivityLogs">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Message</th>
              <th>Log Type</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.object_id}>
                <td>{new Date(log.created_at).toLocaleString('en-GB')}</td>
                <td style={{ whiteSpace: 'pre-line' }}>{log.log_message}</td>
                <td>{utils.makeReadable(log.log_type)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

export default ActivityLogs
