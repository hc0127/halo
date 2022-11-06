import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Title from './../common/Title/Title'
import DashboardButton from '../DashboardButton'
import { sendNotification } from '../../stores/ReduxStores/dashboard/dashboard'

class DialogSendNotification extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  }
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      message: '',
      submitting: false,
    }
  }

  submit = () => {
    if (!this.state.submitting) {
      this.props.dispatch(sendNotification(this.state.message))
      this.setState({ submitting: true })
    }
  }

  render() {
    const { onClose } = this.props
    const { message } = this.state
    return (
      <div className="dialog-evacuate-site dialog--with-form">
        <Title type="h2">Send Notification</Title>
        <label htmlFor="message">
          Message:
          <textarea
            autoFocus /* eslint-disable-line */
            name="message"
            value={this.state.notificationMessage}
            onChange={e => this.setState({ message: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
            onKeyUp={({ key }) =>
              key === 'Enter' && this.state.message && this.submit()
            }
          />
        </label>

        <div className="dialog__button-bar">
          <DashboardButton variant="secondary" onClick={onClose}>
            Cancel
          </DashboardButton>
          <DashboardButton disabled={!message} onClick={() => this.submit()}>
            Send
          </DashboardButton>
        </div>
      </div>
    )
  }
}

export default DialogSendNotification
