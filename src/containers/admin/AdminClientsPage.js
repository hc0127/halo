import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { connect } from 'react-redux'

import utils from '../../utils/helpers'
import {
  ADMIN_TABLE_VARIANTS,
  BUTTON_ICONS,
  PILL_VARIANT,
} from '../../utils/constants'
import {
  loadClientsAction,
  deleteClientsAction,
  suspendClientsAction,
} from '../../stores/ReduxStores/admin/clients'

import { AdminTable } from '../../components/AdminTable'
import {
  AdminTitle,
  AdminPage,
  AdminTempName,
} from '../../components/common/Admin'
import Pill from '../../components/common/Pill'

class AdminClientsPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    clients: PropTypes.array.isRequired,
    eventCounts: PropTypes.object.isRequired,
    staffCounts: PropTypes.object.isRequired,
  }

  componentDidMount() {
    this.props.dispatch(loadClientsAction())
  }

  get tableData() {
    const { clients, eventCounts, staffCounts } = this.props

    return clients
      .map(client => {
        let licenceExpiry = `-`
        if (client.licence_expiry) {
          const expiryDiff =
            client.licence_expiry &&
            moment(client.licence_expiry)
              .add(1, 'days')
              .diff(moment(), 'days')

          if (expiryDiff > 0) {
            licenceExpiry = `${expiryDiff} day${expiryDiff > 1 ? 's' : ''}`
          } else {
            licenceExpiry = `Expired`
          }
        }

        return {
          id: client.object_id,
          clientName: client.name,
          createdAt: utils.formatDate(client.created_at),
          licenceExpiry,
          eventCount: `${eventCounts[client.object_id] ||
            0}/${client.event_limit || '-'}`,
          staffCount: `${staffCounts[client.object_id] ||
            0}/${client.staff_limit || '-'}`,
          suspended: client.suspended,
        }
      })
      .sort((a, b) => (a.name < b.name ? -1 : 1))
  }

  deleteClients(clients) {
    this.props.dispatch(deleteClientsAction(clients.map(client => client.id)))
  }

  suspendClients(clients) {
    this.props.dispatch(suspendClientsAction(clients.map(client => client.id)))
  }

  render() {
    const { history } = this.props
    return (
      <AdminPage>
        <AdminTitle>Clients</AdminTitle>
        <AdminTable
          onCreateClick={() => history.push(`/admin/clients/create`)}
          onRowClick={row => history.push(`/admin/clients/${row.id}`)}
          data={this.tableData}
          headers={[
            'Clients',
            'Registered',
            'Licence Expiry',
            'Events',
            'Staff',
          ]}
          columns={[
            'clientName',
            'createdAt',
            'licenceExpiry',
            'eventCount',
            'staffCount',
          ]}
          customRenders={[
            {
              column: 'clientName',
              render: row => (
                <AdminTempName name={row.clientName}>
                  {row.suspended && <Pill variant={PILL_VARIANT.Suspended} />}
                </AdminTempName>
              ),
            },
          ]}
          globalActions={[
            {
              icon: BUTTON_ICONS.Delete,
              title: 'Delete',
              onClick: rows => this.deleteClients(rows),
            },
            {
              icon: BUTTON_ICONS.Suspend,
              title: 'Suspend',
              onClick: rows => this.suspendClients(rows),
            },
          ]}
          variant={ADMIN_TABLE_VARIANTS.FullPage}
          searchPlaceholder="Search clients"
          searchFilterKey="clients"
        />
      </AdminPage>
    )
  }
}

export default connect(state => ({
  clients: Object.values(state.clients.data),
  staffCounts: state.clients.extraData.staffCounts,
  eventCounts: state.clients.extraData.eventCounts,
}))(AdminClientsPage)
