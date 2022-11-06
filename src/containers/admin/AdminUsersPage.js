import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Parse from 'parse'

import utils from '../../utils/helpers'
import {
  BUTTON_ICONS,
  PILL_VARIANT,
  ROUTES,
  DIALOG_TYPE,
  ADMIN_TABLE_VARIANTS,
} from '../../utils/constants'

import { AdminTable } from '../../components/AdminTable'
import {
  AdminTitle,
  AdminPage,
  AdminTempName,
} from '../../components/common/Admin'
import Pill from '../../components/common/Pill'
import {
  loadUsersAction,
  deleteUsersAction,
  suspendUsersAction,
  clearUsers,
} from '../../stores/ReduxStores/admin/users'
import { openDialog } from '../../stores/ReduxStores/dialog'
import { withUserContext } from '../../Contexts'
import { loadClientsAction } from '../../stores/ReduxStores/admin/clients'
import AdminClientLimitDisplay from '../../components/common/Admin/AdminClientLimitDisplay'
import { loadEventsAction } from '../../stores/ReduxStores/admin/events'

class AdminUsersPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    users: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    staffCounts: PropTypes.objectOf(PropTypes.number).isRequired,
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
    currentUser: PropTypes.instanceOf(Parse.User).isRequired,
    clients: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    pageCount: PropTypes.number.isRequired,
    nextPageNo: PropTypes.number,
    prevPageNo: PropTypes.number,
    filterClientId: PropTypes.string,
    filterValues: PropTypes.object,
    staffCount: PropTypes.number.isRequired,
  }

  static defaultProps = {
    nextPageNo: null,
    prevPageNo: null,
    filterClientId: '',
    filterValues: {},
    staffCount: 0,
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    const { filterClientId, filterValues } = this.props

    this.props.dispatch(loadClientsAction())
    this.props.dispatch(
      loadUsersAction(1, filterClientId, filterValues?.users || '', 10),
    )
    this.props.dispatch(loadEventsAction())
  }

  componentWillUnmount() {
    const { dispatch } = this.props

    dispatch(clearUsers())
  }

  get tableData() {
    const { users } = this.props
    console.error(users);
    return users.map(user => ({
      id: user.object_id,
      name: user.name,
      role:user.role,
      email: user.email,
      permission: utils.getFriendlyPermissions(user.permission_role),
      clientId: user.client?.object_id,
      clientName: user.client?.name,
      suspended: user.suspended,
    }))
  }

  deleteUsers(users) {
    const { filterClientId, filterValues } = this.props
    this.props.dispatch(deleteUsersAction(users.map(user => user.id), filterClientId, filterValues?.users || ''))
  }

  suspendUsers(users) {
    this.props.dispatch(suspendUsersAction(users.map(user => user.id)))
  }

  render() {
    const { history, dispatch, currentUser, clients, } = this.props

    return (
      <AdminPage>
        <AdminClientLimitDisplay />
        <AdminTitle>People</AdminTitle>
        <AdminTable
          isPaginated
          pageCount={this.props.pageCount}
          fetchAction={loadUsersAction}
          nextPageNo={this.props.nextPageNo}
          prevPageNo={this.props.prevPageNo}
          onCreateClick={
            utils.isUserAllowedToCreateUsers(
              currentUser,
              {[currentUser.client.object_id]:this.props.staffCount}
            )
              ? () => history.push(ROUTES.Private.AdminUserCreate)
              : null
          }
          data={this.tableData}
          onRowClick={row => history.push(`/admin/users/${row.id}`)}
          headers={['People', 'Role','Email', 'Permission']}
          columns={['name', 'role', 'email', 'permission']}
          customRenders={[
            {
              column: 'name',
              render: row => (
                <AdminTempName name={row.name} clientName={row.clientName}>
                  {row.suspended && <Pill variant={PILL_VARIANT.Suspended} />}
                </AdminTempName>
              ),
            },
          ]}
          globalActions={[
            {
              icon: BUTTON_ICONS.Delete,
              title: 'Delete',
              onClick: rows => this.deleteUsers(rows),
            },
            {
              icon: BUTTON_ICONS.Suspend,
              title: 'Suspend',
              onClick: rows => this.suspendUsers(rows),
            },
          ]}
          rowActions={[
            {
              icon: BUTTON_ICONS.Password,
              onClick: row =>
                dispatch(
                  openDialog({
                    type: DIALOG_TYPE.ResetPassword,
                    userId: row.id,
                  }),
                ),
              title: 'Reset Password',
            },
          ]}
          variant={ADMIN_TABLE_VARIANTS.FullPage}
          searchPlaceholder="Search people"
          searchFilterKey="users"
          clients={clients}
        />
      </AdminPage>
    )
  }
}

export default compose(
  withUserContext,
  connect((state,props) => {
    const clientId = props.match.params.id
    return{
    users: Object.values(state.users.data),
    clients: Object.values(state.clients.data),
    staffCounts: state.clients.extraData.staffCounts,
    nextPageNo: state.users.nextPageNo,
    prevPageNo: state.users.prevPageNo,
    pageCount: state.users.pageCount,
    filterClientId: state.admin.filterClientId,
    searchTerm: state.admin.filterValues,
    staffCount: state.users.count || 0
  }}),
)(AdminUsersPage)
