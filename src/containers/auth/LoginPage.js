import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { AdminField } from '../../components/common/Admin'
import AdminButton from '../../components/common/Admin/AdminButton'
import { ALERT_BOX_VARIANTS, VARIANT, TITLE_TYPES } from '../../utils/constants'
import Card from '../../components/Card'
import Title from '../../components/common/Title/Title'
import AlertBox from '../../components/common/AlertBox/AlertBox'
import { loginAction } from '../../stores/ReduxStores/auth'
import AdminNotification from '../../components/common/Admin/AdminNotification'

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.string,
  isAlertOpen: PropTypes.bool,
  toggleAlert: PropTypes.func,
}

class LoginPage extends Component {
  constructor() {
    super()
    this.state = { username: '', password: '' }
  }

  login(e) {
    e.preventDefault()

    const { dispatch } = this.props
    const { username, password } = this.state

    dispatch(loginAction(username, password))
  }

  updateField(fieldName) {
    return value => this.setState({ [fieldName]: value })
  }

  render() {
    const { username, password } = this.state
    const { isAlertOpen, toggleAlert } = this.props

    const requiredFields = username && password

    return (
      <div className="login-page">
        <Card>
          <form onSubmit={e => this.login(e)} className="login-form">
            <Title type={TITLE_TYPES.h1} variant="primary">
              Login
            </Title>
            <AdminField
              label="Username"
              type="text"
              value={this.state.username}
              onChange={this.updateField('username')}
              error={username ? '' : 'Please enter a username'}
            />
            <AdminField
              label="Password"
              type="password"
              value={this.state.password}
              onChange={this.updateField('password')}
              error={password ? '' : 'Please enter a password'}
            />
            <AlertBox
              variant={ALERT_BOX_VARIANTS.Danger}
              visible={!!this.props.error}
            >
              {this.props.error}
            </AlertBox>
            <AdminButton variant={VARIANT.Primary} disabled={!requiredFields}>
              Login
            </AdminButton>
          </form>
        </Card>
        {isAlertOpen && (
          <AdminNotification
            message="Password successfully reset"
            onClose={() => toggleAlert(false)}
            bottom={0}
          />
        )}
      </div>
    )
  }
}

LoginPage.propTypes = propTypes

LoginPage.defaultProps = {
  error: '',
  isAlertOpen: false,
  toggleAlert: () => {},
}

export default connect(state => ({ error: state.auth.error }))(LoginPage)
