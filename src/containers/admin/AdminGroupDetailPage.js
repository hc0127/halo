import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Parse from 'parse'
import { compose } from 'redux'
import { withRouter } from 'react-router-dom'
import { Prompt } from 'react-router'

import { DIALOG_TYPE, USER_PERMISSIONS, ROUTES } from '../../utils/constants'
import { withUserContext } from '../../Contexts'
import utils from '../../utils/helpers'

import { loadClientsAction } from '../../stores/ReduxStores/admin/clients'
import {
  loadGroupsAction,
  saveGroup,
  refreshGroup,
} from '../../stores/ReduxStores/admin/groups'
import { loadEventsAction } from '../../stores/ReduxStores/admin/events'
import {
  loadUsersAction,
  clearUsers,
} from '../../stores/ReduxStores/admin/users'
import { openDialog } from '../../stores/ReduxStores/dialog'

import {
  AdminForm,
  AdminFormColumn,
  AdminFormRow,
} from '../../components/AdminForm'
import AdminSavePanel from '../../components/common/Admin/AdminSavePanel'
import Loading from '../../components/common/Loading/Loading'
import {
  AdminField,
  AdminButton,
  AdminTitle,
  AdminPage,
  AdminTabCard,
  AdminTabTitle,
  AdminTabContent,
  AdminStaffSelector,
  AdminClientSelector,
} from '../../components/common/Admin'
import WarnBeforeLeave from '../../components/WarnBeforeLeave'

class AdminGroupDetailPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    group: PropTypes.instanceOf(Parse.Object),
    users: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    status: PropTypes.string.isRequired,
    clients: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    newGroup: PropTypes.bool,
    currentUser: PropTypes.instanceOf(Parse.User).isRequired,
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
    clientId: PropTypes.string,
  }

  static defaultProps = { group: null, newGroup: false, clientId: '' }

  constructor(props) {
    super(props)
    this.state = {
      selectedUserIds: [],
      name: '',
      userSearch: '',
      clientId: '',
      searchFocused: false,
      stateChanged: false,
      iconFile: null,
      shiftManagerId: '',
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.newGroup && !state.loaded && props.clients.length) {
      return { loaded: true }
    }
    if (props.group && !state.loaded) {
      const { dispatch } = props
      dispatch(loadUsersAction(1, props.clientId))

      return {
        selectedUserIds: props.group.users.map(user => user),
        name: props.group.name,
        clientId: props.group.client.object_id,
        loaded: true,
      }
    }

    if (state.loaded && props.status === 'saved') {
      props.dispatch(refreshGroup())
      if (props.newGroup) {
        props.history.push(ROUTES.Private.AdminUserGroups)
        return null
      }

      return { loaded: false }
    }

    return null
  }

  componentDidMount() {
    const { dispatch } = this.props

    dispatch(loadClientsAction())
    dispatch(loadGroupsAction())
    dispatch(loadEventsAction())
  }

  componentWillUnmount() {
    const { dispatch } = this.props

    dispatch(clearUsers())
  }

  getClientUsers() {
    const { users } = this.props

    return users.filter(user => !user.suspended)
  }

  updateField(fieldName, updateStateChanged = true) {
    return value => {
      const { stateChanged } = this.state
      this.setState(
        {
          [fieldName]: value,
          stateChanged: updateStateChanged ? true : stateChanged,
        },
        () => {
          if (fieldName === 'clientId') {
            const { dispatch } = this.props
            dispatch(loadUsersAction(1, value))
          }
        },
      )
    }
  }

  updateFileField(fieldName) {
    return file => {
      this.setState({ [fieldName]: file, stateChanged: true })
    }
  }

  saveGroup() {
    const { dispatch, group, users, currentUser } = this.props
    const { selectedUserIds } = this.state
    const filteredUsers = users
      .filter(user => selectedUserIds.includes(user.object_id))
      .map(user => user.object_id)

    dispatch(
      saveGroup({
        id: group?.object_id,
        ...this.state,
        clientId: this.state.clientId || this.props.clientId,
        users: filteredUsers,
        currentUser,
      }),
    )
    this.setState({ stateChanged: false })
  }

  render() {
    const {
      dispatch,
      newGroup,
      status,
      clients,
      currentUser,
      group,
    } = this.props
    if (!(group || newGroup)) {
      return <Loading centered />
    }

    const {
      name,
      selectedUserIds,
      stateChanged,
      iconFile,
      clientId,
    } = this.state

    const requiredFields =
      (clientId ||
        currentUser.permission_role === USER_PERMISSIONS.ClientManager) &&
      name &&
      utils.notWhitespace(name)

    return (
      <AdminPage>
        {stateChanged && (
          <Prompt message="You have unsaved changes, are you sure you want to leave?" />
        )}
        <WarnBeforeLeave enabled={stateChanged} />
        <AdminTitle>Team</AdminTitle>
        {currentUser.permission_role === USER_PERMISSIONS.CrestAdmin && (
          <AdminClientSelector
            value={clientId}
            clients={clients}
            onChange={this.updateField('clientId')}
            editing={!newGroup}
            required="Please select a client."
          />
        )}
        <AdminTabCard>
          <AdminTabTitle>Details</AdminTabTitle>
          <AdminTabContent>
            <AdminForm>
              <AdminFormColumn size={6}>
                <AdminFormRow>
                  <AdminField
                    label="Group Name"
                    type="text"
                    value={name}
                    onChange={this.updateField('name')}
                    required="Please enter a group name."
                    error={
                      utils.notWhitespace(name)
                        ? ''
                        : 'Please enter a name containing characters'
                    }
                  />
                </AdminFormRow>
                <AdminFormRow size={2}>
                  <AdminField
                    label="Group Icon"
                    type="file"
                    value={iconFile}
                    onChange={this.updateFileField('iconFile')}
                    allowedFileTypes={['png', 'jpg', 'svg']}
                    maxWidth={256}
                    maxHeight={256}
                  />
                </AdminFormRow>
              </AdminFormColumn>
              <AdminFormColumn size={6} />
            </AdminForm>
          </AdminTabContent>
          <AdminTabTitle>People</AdminTabTitle>
          <AdminTabContent>
            <AdminStaffSelector
              onStaffCreateClick={onUserCreated =>
                dispatch(
                  openDialog({
                    type: DIALOG_TYPE.CreateUser,
                    onUserCreated,
                    clientId,
                  }),
                )
              }
              onStaffEditClick={userId =>
                dispatch(openDialog({ type: DIALOG_TYPE.EditUser, userId }))
              }
              users={this.getClientUsers()}
              eventUserIds={selectedUserIds}
              onChange={userIds => {
                this.setState({ selectedUserIds: userIds, stateChanged: true })
              }}
            />
          </AdminTabContent>
        </AdminTabCard>
        <AdminSavePanel>
          <AdminButton
            onClick={() => this.saveGroup()}
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
  withRouter,
  connect((state, props) => {
    const { auth } = state
    const { currentUser } = auth
    const userGroupId = props.match.params.id
    const group = state.groups.data[userGroupId]

    let clientId = ''
    if (group) {
      clientId = group.client.object_id
    }

    if (currentUser.permission_role === 'ClientManager') {
      clientId = currentUser.client.object_id
    }

    return {
      group,
      users: Object.values(state.users.data),
      clientId,
      status: state.groups.status,
      clients: Object.values(state.clients.data).filter(client =>
        utils.hasUserGroups(client),
      ),
    }
  }),
)(AdminGroupDetailPage)
