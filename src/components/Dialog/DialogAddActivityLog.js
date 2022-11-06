import React, { Component } from 'react'
import PropTypes from 'prop-types'

import DashboardButton from './../DashboardButton'
import { addActivityLog } from '../../stores/ReduxStores/dashboard/logs'
import btnSend from '../../images/send-message.png'

class DialogAddActivityLog extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  }
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = { message: '' }
  }

  submit = () => {
    this.props.dispatch(addActivityLog(this.state.message, 'dashboard'))
  }

  render() {
    return (
      <div className="dialog-add-activity-log" style={{ display: 'flex' }}>
        <div style={{ width: '90%' }}>
          <textarea
            autoFocus /* eslint-disable-line */
            placeholder="Activity Details. Press 'Enter' to save. Press 'Shift+Enter' for new line"
            className="dialog-add-activity-log__textarea"
            value={this.state.message}
            onChange={e => this.setState({ message: e.target.value })}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.shiftKey) {
                // Do nothing in this case treat it as default enter
              } else if (e.key === 'Enter') {
                e.preventDefault()
                this.submit()
                this.setState({ message: '' })
              }
            }}
          />
        </div>
        <button
          onClick={e => {
            if (this.state.message.length > 0) {
              this.submit()
              this.setState({ message: '' })
            }
          }}
        >
          <div>
            <img src={btnSend} alt="Send Logs" height={30} width={30} />
          </div>
        </button>
      </div>
    )
  }
}

export default DialogAddActivityLog
