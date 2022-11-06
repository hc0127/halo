import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Parse from 'parse'
import { withRouter } from 'react-router-dom'

import { BUTTON_ICONS, ADMIN_TABLE_VARIANTS } from '../../utils/constants'

import { AdminTable } from '../../components/AdminTable'
import {
  AdminTitle,
  AdminPage,
  AdminTempName,
} from '../../components/common/Admin'
import { loadClientsAction } from '../../stores/ReduxStores/admin/clients'
import {
  loadGroupsAction,
  deleteGroupsAction,
} from '../../stores/ReduxStores/admin/groups'
import AdminClientLimitDisplay from '../../components/common/Admin/AdminClientLimitDisplay'
import { loadEventsAction } from '../../stores/ReduxStores/admin/events'

class AdminGroupsPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    groups: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    clients: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    history: PropTypes.object.isRequired,
  }

  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.props.dispatch(loadClientsAction())
    this.props.dispatch(loadGroupsAction())
    this.props.dispatch(loadEventsAction())
  }

  get tableData() {
    const { groups } = this.props
    return groups.map(group => ({
      id: group.object_id,
      name: group.name,
      userCount: group.users.length,
      clientId: group.client.object_id,
      clientName: group.client.name,
    }))
  }

  deleteGroups(groups) {
    this.props.dispatch(deleteGroupsAction(groups.map(group => group.id)))
  }

  render() {
    const { clients, history } = this.props
    return (
      <AdminPage>
        <AdminClientLimitDisplay />
        <AdminTitle>Teams</AdminTitle>
        <AdminTable
          onCreateClick={() => history.push('/admin/groups/create')}
          data={this.tableData}
          onRowClick={row => history.push('/admin/groups/' + row.id)}
          headers={['Group Name', 'Number of People']}
          columns={['name', 'userCount']}
          customRenders={[
            {
              column: 'name',
              render: row => (
                <AdminTempName name={row.name} clientName={row.clientName} />
              ),
            },
          ]}
          globalActions={[
            {
              icon: BUTTON_ICONS.Delete,
              title: 'Delete',
              onClick: rows => this.deleteGroups(rows),
            },
          ]}
          variant={ADMIN_TABLE_VARIANTS.FullPage}
          searchPlaceholder="Search groups"
          searchFilterKey="groups"
          centerColumnIndexes={[2]}
          clients={clients}
        />
      </AdminPage>
    )
  }
}

export default withRouter(
  connect(state => ({
    groups: Object.values(state.groups.data),
    clients: Object.values(state.clients.data),
  }))(AdminGroupsPage),
)
