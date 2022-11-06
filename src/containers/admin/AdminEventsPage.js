import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import moment from 'moment'
import {
  AdminPage,
  AdminTitle,
  AdminTempName,
} from '../../components/common/Admin'
import { AdminTable } from '../../components/AdminTable'
import {
  loadEventsAction,
  deleteEventsAction,
  duplicateEventAction,
} from '../../stores/ReduxStores/admin/events'
import utils from '../../utils/helpers'
import {
  BUTTON_ICONS,
  PILL_VARIANT,
  ROUTES,
  ADMIN_TABLE_VARIANTS,
  USER_PERMISSIONS,
} from '../../utils/constants'
import Pill from '../../components/common/Pill'
import { withUserContext } from '../../Contexts'
import { loadClientsAction } from '../../stores/ReduxStores/admin/clients'
import AdminClientLimitDisplay from '../../components/common/Admin/AdminClientLimitDisplay'
import { loadUsersAction } from '../../stores/ReduxStores/admin/users'

import { clearEventAction } from '../../stores/ReduxStores/admin/activeEvent'
import { createLog } from '../../api/logs'

class AdminEventsPage extends Component {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
    events: PropTypes.array.isRequired,
    eventCounts: PropTypes.objectOf(PropTypes.number).isRequired,
    rowPerPage: PropTypes.number.isRequired,
    initialIndex: PropTypes.number.isRequired,
    clients: PropTypes.array.isRequired,
    eventCount: PropTypes.number.isRequired,
    years: PropTypes.array.isRequired,
  }

  componentDidMount() {
    const { dispatch } = this.props

    dispatch(loadClientsAction())
    dispatch(loadEventsAction())
    dispatch(loadUsersAction())
    dispatch(clearEventAction())
  }

  componentDidUpdate(prevProps) {
    const { eventCount, currentUser } = this.props
    if (eventCount !== prevProps.eventCount) {
      this.forceUpdate()
    }
  }
  deleteEvents(events) {
    const { dispatch } = this.props
    dispatch(deleteEventsAction(events.map(event => event.id)))
  }

  isUserAllowedToCreateEvents(currentUser) {
    const { eventCount } = this.props
    if (
      currentUser.permission_role === USER_PERMISSIONS.CrestAdmin ||
      (currentUser.permission_role === USER_PERMISSIONS.ClientManager &&
      currentUser.client.event_limit !== null
        ? eventCount
          ? eventCount < currentUser.client.event_limit
          : 0 < currentUser.client.event_limit
        : true)
    ) {
      return true
    }
  }

  onEnterEvent = async event => {
    const { currentUser } = this.props
    await createLog(event.id, {
      log_message: `${currentUser.name} has just logged in`,
      log_type: 'signin',
    }).then(() => {
      // WEB-2236
      setTimeout(() => {
        var newWindow = window.open()
        newWindow.location = `/dashboard/${event.id}`
      }, 500)
    })
  }

  render() {
    const {
      history,
      events,
      rowPerPage,
      initialIndex,
      currentUser,
      clients,
      dispatch,
    } = this.props

    return (
      <AdminPage>
        <AdminClientLimitDisplay />
        <AdminTitle>Events/Clients</AdminTitle>
        <AdminTable
          onCreateClick={
            this.isUserAllowedToCreateEvents(currentUser)
              ? () => history.push(ROUTES.Private.AdminEventCreate)
              : null
          }
          rowPerPage={rowPerPage}
          initialIndex={initialIndex}
          onRowClick={row => history.push(`/admin/events/${row.id}`)}
          data={events.map(event => ({
            id: event.object_id,
            title: event.title,
            startDate: utils.formatDate(event.start_date),
            endDate: utils.formatDate(event.end_date),
            clientId: event.client?.object_id,
            clientName: event.client?.name,
            live: moment().isBetween(
              moment(event.start_date),
              moment(event.end_date),
            ),
            isClosed: event.closed,
          }))}
          headers={['Events/Clients', 'Start Date', 'End Date']}
          columns={['title', 'startDate', 'endDate']}
          customRenders={[
            {
              column: 'title',
              render: row => (
                <AdminTempName name={row.title} clientName={row.clientName}>
                  <div className="admin-temp-name__pills">
                    {row.live && <Pill variant={PILL_VARIANT.Live} />}
                    {row.isClosed && <Pill variant={PILL_VARIANT.Closed} />}
                  </div>
                </AdminTempName>
              ),
            },
          ]}
          globalActions={[
            {
              icon: BUTTON_ICONS.Delete,
              title: 'Delete',
              onClick: rows => this.deleteEvents(rows),
            },
          ]}
          rowActions={[
            {
              icon: BUTTON_ICONS.Copy,
              onClick: event =>
                dispatch(duplicateEventAction(event.id, events)),
              disabled: !this.isUserAllowedToCreateEvents(currentUser),
            },
            {
              icon: BUTTON_ICONS.Dashboard,
              onClick: event => this.onEnterEvent(event),
            },
            {
              icon: BUTTON_ICONS.Report,
              onClick: event =>
                window.open(`/dashboard/${event.id}/report`, '_blank'),
            },
          ]}
          searchPlaceholder="Search events"
          searchFilterKey="events"
          variant={ADMIN_TABLE_VARIANTS.FullPage}
          clients={clients}
          isDateFilterDisplay
          years={this.props.years}
        />
      </AdminPage>
    )
  }
}

export default compose(
  withUserContext,
  connect(state => {
    const events = Object.values(state.events.data)

    const uniqueYears = [
      ...new Set(events.map(event => new Date(event.start_date).getFullYear())),
    ]
    const years = []

    uniqueYears.forEach(year => {
      years.push({
        value: year,
        text: year,
      })
    })

    events.sort((event1, event2) => event1.start_date - event2.end_date)

    const rowPerPage = 10

    let liveOrFutureEventIndex = null

    const now = moment()

    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      const startDate = moment(event.start_date)
      const endDate = moment(event.end_date)
      if (startDate.isBefore(now) && endDate.isAfter(now)) {
        liveOrFutureEventIndex = i
        break
      }
      if (startDate.isAfter(now) && !liveOrFutureEventIndex) {
        liveOrFutureEventIndex = i
      }
    }

    let initialIndex = liveOrFutureEventIndex

    // if we have a filter active, disable the "live" event page auto focus
    if (state.admin.filterValues.events || state.admin.filterClientId) {
      initialIndex = 1
    }

    return {
      events,
      clients: Object.values(state.clients.data),
      initialIndex,
      rowPerPage,
      eventCounts: state.clients.extraData.eventCounts,
      eventCount: Object.keys(state.events.data).length,
      years,
    }
  }),
)(AdminEventsPage)
