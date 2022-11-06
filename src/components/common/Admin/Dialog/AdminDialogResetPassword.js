import React, { Component, Fragment } from 'react'
import Parse from 'parse'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import AdminTitle from '../AdminTitle'
import { AdminField, AdminButton } from '..'
import { VARIANT } from '../../../../utils/constants'
import {
  updatePasswordAction,
  sendPasswordResetAction,
} from '../../../../stores/ReduxStores/admin/users'
import utils from '../../../../utils/helpers'

class AdminDialogResetPassword extends Component {
  static propTypes = {
    user: PropTypes.instanceOf(Parse.User).isRequired,
    onClose: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = { password: '', confirmPassword: '', stateChanged: false }
  }

  updateField(fieldName) {
    return value => this.setState({ [fieldName]: value, stateChanged: true })
  }

  render() {
    const { user, onClose, dispatch } = this.props
    const { password, confirmPassword, stateChanged } = this.state

    const requiredFields =
      password &&
      confirmPassword &&
      password === confirmPassword &&
      utils.isValidPassword(password)

    return (
      <Fragment>
        <AdminTitle>Password reset</AdminTitle>
        <AdminField
          label="Password"
          type="password"
          value={password}
          onChange={this.updateField('password')}
          required="Please enter a new password."
          error={
            !utils.isValidPassword(password)
              ? 'Password must be at least 8 characters, have 1 uppercase, 1 lowercase, 1 special and 1 number character.'
              : ''
          }
        />
        <AdminField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={this.updateField('confirmPassword')}
          required="Please enter the same password to confirm."
          error={
            password !== confirmPassword ? 'Passwords must be the same' : ''
          }
        />
        {user?.email && (
          <div className="email-link-container">
            <AdminButton
              variant={VARIANT.NoBackground}
              onClick={() => dispatch(sendPasswordResetAction(user))}
            >
              Send reset link to {user.email}
            </AdminButton>
          </div>
        )}
        <div className="buttons-container">
          <AdminButton hollow variant={VARIANT.Secondary} onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            onClick={() =>
              dispatch(
                updatePasswordAction({ id: user.object_id, ...this.state }),
              )
            }
            disabled={!stateChanged || !requiredFields}
          >
            Reset Password
          </AdminButton>
        </div>
      </Fragment>
    )
  }
}

export default connect((state, props) => ({
  user: state.users.data[props.userId],
}))(AdminDialogResetPassword)
