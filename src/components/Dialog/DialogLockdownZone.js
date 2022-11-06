import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'

import Title from './../common/Title/Title'
import { lockdownZone } from '../../stores/ReduxStores/dashboard/dashboard'
import DashboardButton from '../DashboardButton'

class DialogLockdownZone extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    event: PropTypes.instanceOf(Parse.Object).isRequired,
  }
  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {
      lockdownArea: '',
      lockdownMessage: '',
      submitting: false,
    }
  }

  submit = () => {
    if (!this.state.submitting) {
      this.props.dispatch(
        lockdownZone(
          `Lockdown Alert. ${this.state.lockdownArea ||
            'The event'} is being locked down. Reason: ${
            this.state.lockdownMessage
          }`,
        ),
      )
      this.setState({ submitting: true })
    }
  }

  render() {
    const { event, onClose } = this.props

    return (
      <div className="dialog-lockdown dialog--with-form">
        <Title type="h2">Send Lockdown Alert</Title>
        <div>
          <span>Area to lockdown:</span>
          <select /* eslint-disable-line */
            value={this.state.lockdownArea}
            onChange={e => this.setState({ lockdownArea: e.target.value })}
          >
            <option value="">Select</option>
            {event?.zones?.map(area => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="message">
            Lockdown notes:
            <textarea
              autoFocus /* eslint-disable-line */
              name="message"
              value={this.state.lockdownMessage}
              onChange={e => this.setState({ lockdownMessage: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
              onKeyUp={e =>
                e.key === 'Enter' &&
                this.state.lockdownMessage &&
                this.state.lockdownArea &&
                this.submit()
              }
            />
          </label>
        </div>

        <div className="dialog__button-bar">
          <DashboardButton onClick={onClose} variant="secondary">
            Cancel
          </DashboardButton>
          <DashboardButton
            disabled={!this.state.lockdownMessage || !this.state.lockdownArea}
            onClick={() => this.submit()}
          >
            Send
          </DashboardButton>
        </div>
      </div>
    )
  }
}

export default connect(state => ({ event: state.currentEvent.event }))(
  DialogLockdownZone,
)
