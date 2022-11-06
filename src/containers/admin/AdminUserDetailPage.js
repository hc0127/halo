import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Prompt } from 'react-router'
import Parse from 'parse'
import _ from 'lodash'

import {
  ROUTES,
  ROLE_OPTIONS,
  USER_PERMISSIONS,
  VARIANT,
} from '../../utils/constants'

import { Loading } from '../../components/common'
import {
  AdminPage,
  AdminTitle,
  AdminButton,
  AdminCard,
  AdminField,
  AdminCardBody,
  AdminClientSelector,
  AdminPinDropdown,
} from '../../components/common/Admin'
import {
  AdminForm,
  AdminFormColumn,
  AdminFormRow,
} from '../../components/AdminForm'
import {
  saveUser,
  loadUser,
  refreshUser,
  clearUser,
} from '../../stores/ReduxStores/admin/users'
import { loadClientsAction } from '../../stores/ReduxStores/admin/clients'
import { closeDialog } from '../../stores/ReduxStores/dialog'
import { withUserContext } from '../../Contexts'
import utils from '../../utils/helpers'
import AdminSavePanel from '../../components/common/Admin/AdminSavePanel'
import WarnBeforeLeave from '../../components/WarnBeforeLeave'

import { checkUsername, checkEmail } from '../../api/users'

class AdminUserDetailPage extends Component {
  static propTypes = {
    newUser: PropTypes.bool,
    clients: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    user: PropTypes.instanceOf(Parse.User),
    status: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({ id: PropTypes.string }).isRequired,
    }).isRequired,
    clientId: PropTypes.string,
    isDialog: PropTypes.bool,
    currentUser: PropTypes.instanceOf(Parse.User).isRequired,
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  }

  static defaultProps = {
    newUser: false,
    user: null,
    clientId: null,
    isDialog: false,
  }

  // not going through a saga because it feels like complexity for little point
  // since the username/email is in the local state, not the global state.
  // and it needs to be checked when they type, rather than when they save
  checkUsername = _.debounce(async username => {
    try {
      await checkUsername(username)
      this.setState({ usernameCheckStatus: 'valid' })
    } catch (err) {
      this.setState({ usernameCheckStatus: 'error' })
    }
  }, 1000)

  checkEmail = _.debounce(async email => {
    try {
      await checkEmail(email)
      this.setState({ emailCheckStatus: 'valid' })
    } catch (err) {
      console.log(err)
      this.setState({ emailCheckStatus: 'error' })
    }
  }, 1000)

  constructor(props) {
    super(props)
    this.state = {
      username: '',
      email: '',
      clientId: props.clientId,
      name: '',
      mobileNumber: '',
      pin: 'standard',
      customPinFile: null,
      password: '',
      role: '',
      permissionRole: 'NormalUser',
      suspended: false,
      stateChanged: false,
      loaded: false,
      usernameCheckStatus: 'valid',
      emailCheckStatus: 'valid',
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.newUser && !state.loaded) {
      return { loaded: true }
    }

    if (props.user && !state.loaded) {
      return {
        username: props.user.username,
        email: props.user.email || '',
        clientId: props.user?.client?.object_id,
        name: props.user.name,
        mobileNumber: props.user.mobile_number,
        password: '',
        role: props.user.role,
        permissionRole: props.user.permission_role,
        suspended: props.user.suspended,
        loaded: true,
        pin: props.user.pin,
        customPinFile: props.user?.pin_icon_url || '',
      }
    }

    const {
      location: { href },
    } = window

    const isUserPage = href.includes('user')

    if (
      state.loaded &&
      props.status === 'saved' &&
      isUserPage &&
      props.newUser
    ) {
      props.history.push(ROUTES.Private.AdminUsers)
      return { loaded: false }
    }

    return null
  }

  componentDidMount() {
    const { dispatch } = this.props

    if (this.props.match.params.id) {
      const userId = this.props.match.params.id
      dispatch(loadUser(userId))
    }

    dispatch(loadClientsAction())
  }

  componentWillUnmount() {
    const { dispatch } = this.props
    dispatch(clearUser())
  }

  getUsernameStatus(error) {
    const { usernameCheckStatus } = this.state

    return error
      ? usernameCheckStatus === 'error' && 'Username already in use'
      : usernameCheckStatus === 'checking' && 'Checking...'
  }

  getEmailStatus(error) {
    const { emailCheckStatus, email } = this.state

    if (!email) {
      return false
    }

    return error
      ? emailCheckStatus === 'error' && 'Email already in use'
      : emailCheckStatus === 'checking' && 'Checking...'
  }

  getAllowedUserPermissions(clientId) {
    const { currentUser, clients } = this.props
    const { permissionRole } = this.state

    const selectedClient = clients.find(
      ({ object_id }) => object_id === clientId,
    )
    console.log(ROLE_OPTIONS, permissionRole, currentUser)

    return ROLE_OPTIONS.filter(({ value }) => {
      // make sure the client has the targeted dash feature to allow users to have this permission
      if(value === 'ClientManager' && currentUser.permission_role === 'ClientManager'){
        return false
      }
      if (value === USER_PERMISSIONS.TargetedDashboardUser) {
        return utils.hasTargetedDashboard(selectedClient)
      }

      if (utils.canUserSetRole(currentUser, value)) {
        return true
      }

      return value === permissionRole
    })
  }

  updateField(fieldName) {
    return value => {
      const newState = {
        [fieldName]: value,
        stateChanged: true,
      }
      if (fieldName === 'username') {
        newState.usernameCheckStatus = 'checking'
        if (value) {
          this.checkUsername(value)
        } else {
          newState.usernameCheckStatus = 'error'
        }
      }
      if (fieldName === 'email') {
        newState.emailCheckStatus = 'checking'
        if (value) {
          this.checkEmail(value)
        }
      }
      this.setState(newState)
    }
  }

  saveUser() {
    const { dispatch, match, clientId: overrideClientId } = this.props
    const { clientId: selectedClientId } = this.state
    const {
      location: { href },
    } = window

    const isRenderedOnUserPage = href.includes('users')

    dispatch(
      saveUser(
        {
          id: match.params.id,
          ...this.state,
          clientId: overrideClientId || selectedClientId,
        },
        isRenderedOnUserPage,
      ),
    )
    this.setState({ stateChanged: false })
  }

  generatePassword() {
    let password = ''

    // try to generate 10 times
    for (let i = 0; i < 10; i++) {
      // generate a random password
      const buffer = new Uint8Array(8)
      window.crypto.getRandomValues(buffer)
      password = btoa(String.fromCharCode.apply(null, buffer))

      if (utils.isValidPassword(password)) {
        break
      }
    }

    this.setState({ password })
  }

  render() {
    const {
      user,
      newUser,
      status,
      clients,
      clientId: overrideClientId,
      isDialog,
      currentUser,
      dispatch,
    } = this.props

    if (!(user || newUser)) {
      return <Loading centered />
    }

    const {
      username,
      email,
      name,
      mobileNumber,
      password,
      role,
      permissionRole,
      stateChanged,
      pin,
      suspended,
      usernameCheckStatus,
      emailCheckStatus,
      clientId: selectedClientId,
      customPinFile,
    } = this.state

    const clientId = overrideClientId || selectedClientId
    const isClientManagerOrCrestAdmin =
      currentUser.permission_role === USER_PERMISSIONS.ClientManager ||
      currentUser.permission_role === USER_PERMISSIONS.CrestAdmin

    const clientIds = isClientManagerOrCrestAdmin
      ? this.props.currentUser.client.object_id
      : ''
    const requiredFields =
      clientIds &&
      isClientManagerOrCrestAdmin &&
      username &&
      usernameCheckStatus === 'valid' &&
      (!email || (emailCheckStatus === 'valid' && utils.isValidEmail(email))) &&
      name &&
      role &&
      (!mobileNumber || mobileNumber.length >= 11) &&
      (!newUser || (password && utils.isValidPassword(password))) &&
      username === username.trim()

    return (
      <AdminPage>
        {stateChanged && (
          <Prompt message="You have unsaved changes, are you sure you want to leave?" />
        )}
        <WarnBeforeLeave enabled={stateChanged} />
        <AdminTitle>{name || 'Create Person'}</AdminTitle>
        {currentUser.permission_role === USER_PERMISSIONS.CrestAdmin &&
          !overrideClientId && (
            <AdminClientSelector
              value={clientId}
              clients={clients}
              onChange={this.updateField('clientId')}
              editing={!newUser}
              error={
                permissionRole !== USER_PERMISSIONS.CrestAdmin &&
                !clientId &&
                'Please select a client.'
              }
            />
          )}
        {!newUser && (
          <div className="admin-user__suspended-container">
            <AdminCard>
              <AdminCardBody thin>
                <AdminField
                  label="Suspended"
                  type="switch"
                  value={suspended}
                  onChange={this.updateField('suspended')}
                  variant={VARIANT.Secondary}
                />
              </AdminCardBody>
            </AdminCard>
          </div>
        )}
        <AdminCard title="">
          <AdminCardBody>
            <AdminForm>
              <AdminFormColumn size={2}>
                <AdminFormRow>
                  <AdminField
                    label="Username"
                    type="text"
                    value={username}
                    onChange={this.updateField('username')}
                    required="Please enter a username."
                    error={
                      this.getUsernameStatus(true) ||
                      (username.trim() !== username &&
                        'Username should not contain spaces at the start or the end.')
                    }
                    tooltip={this.getUsernameStatus()}
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Full Name"
                    type="text"
                    value={name}
                    onChange={this.updateField('name')}
                    required="Please enter a name."
                  />
                </AdminFormRow>
                <AdminFormRow>
                  {newUser && (
                    <div className="admin-user__password-container">
                      <AdminField
                        label="Password"
                        type="text"
                        value={password}
                        onChange={this.updateField('password')}
                        required="Please enter password."
                        error={
                          !utils.isValidPassword(password) &&
                          'Password must be at least 8 characters, have 1 uppercase, 1 lowercase, 1 special and 1 number character'
                        }
                      />
                      <AdminButton
                        hollow
                        onClick={() => this.generatePassword()}
                      >
                        Generate
                      </AdminButton>
                    </div>
                  )}
                </AdminFormRow>
              </AdminFormColumn>
              <AdminFormColumn>
                <AdminFormRow>
                  <AdminField
                    label="Email"
                    type="text"
                    value={email}
                    onChange={this.updateField('email')}
                    error={
                      this.getEmailStatus(true) ||
                      (!utils.isValidEmail(email) &&
                        'This email is not a valid email address.')
                    }
                    tooltip={this.getEmailStatus()}
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Phone"
                    type="text"
                    value={mobileNumber}
                    onChange={this.updateField('mobileNumber')}
                    error={
                      mobileNumber?.length < 11 &&
                      'Phone number must be at least 11 digits.'
                    }
                    tooltip={
                      !mobileNumber && 'Required for Facetime on iOS devices'
                    }
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Role"
                    type="text"
                    value={role}
                    onChange={this.updateField('role')}
                    required="Please enter a role."
                  />
                </AdminFormRow>
              </AdminFormColumn>
              <AdminFormColumn>
                <AdminFormRow>
                  <AdminPinDropdown
                    value={pin.toLowerCase()}
                    onChange={this.updateField('pin')}
                    onFileSelection={this.updateField('customPinFile')}
                    fullName={name}
                    customPinFile={customPinFile}
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Permission"
                    type="dropdown"
                    options={this.getAllowedUserPermissions(clientId)}
                    value={permissionRole}
                    onChange={this.updateField('permissionRole')}
                    disabled={
                      !utils.canUserSetRole(currentUser, permissionRole)
                    }
                  />
                </AdminFormRow>
              </AdminFormColumn>
            </AdminForm>
          </AdminCardBody>
        </AdminCard>
        <AdminSavePanel inDialog={isDialog}>
          {isDialog && (
            <AdminButton
              onClick={() => dispatch(closeDialog())}
              variant={VARIANT.Secondary}
              hollow
            >
              Cancel
            </AdminButton>
          )}
          <AdminButton
            onClick={() => this.saveUser()}
            loading={status === 'saving'}
            disabled={!stateChanged || !requiredFields}
          >
            Save
          </AdminButton>
        </AdminSavePanel>
      </AdminPage>
    )
  }
}

export default compose(
  withUserContext,
  connect(state => {
    return {
      user: state.users.activeUser,
      status: state.users.status,
      clients: Object.values(state.clients.data),
      clientId:
        state.auth.currentUser.permission_role ===
        USER_PERMISSIONS.ClientManager
          ? state.auth.currentUser.client.object_id
          : '',
    }
  }),
)(AdminUserDetailPage)
