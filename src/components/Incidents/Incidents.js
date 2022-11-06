import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import { compose } from 'redux'

import { USER_PERMISSIONS } from '../../utils/constants'

import utils from '../../utils/helpers'
import dashboardUtils from '../../utils/dashboardFilterHelpers'

import { loadEventGeofences } from '../../stores/ReduxStores/dashboard/eventGeofences'
import {
  loadIncidents,
  addNewIncident,
  setUpdatedIncident,
  formatIncident,
  removeIncident,
  markIncidentMessageAsRead,
  setLiveIncidents,
  setLiveIncidentTypes,
} from '../../stores/ReduxStores/dashboard/incidents'
import {
  setGeofenceFilter,
  resetFilters,
  openIncidentView,
  setGroupFilter,
} from '../../stores/ReduxStores/dashboard/dashboard'
import { loadStaffGroups } from '../../stores/ReduxStores/dashboard/staffGroups'
import IncidentTable from '../IncidentTable'

import CapacityView from '../CapacityView/CapacityView'
import Card from '../Card'
import NumberCard from '../NumberCard'
import IncidentListItem from '../IncidentListItem'
import DashboardGroupFilter from '../DashboardGroupFilter'
import { Loading } from '../common'
import DashboardSelect from '../DashboardSelect'
import { withUserContext } from '../../Contexts'
import { notify } from '../../stores/ReduxStores/admin/admin'
import incident_sound from '../../images/Notification.wav'

import { client } from '../../appsync-service'
import {
  onCreateIncidentSubscription as onCreateIncidentSubscriptionQuery,
  onUpdateIncidentSubscription as onUpdateIncidentSubscriptionQuery,
  onCreateIncidentMessageSubscription as onCreateIncidentMessageSubscriptionQuery,
  onCreateMarkIncidentAsReadSubscription as onCreateMarkIncidentAsReadSubscriptionQuery,
  onCreateIncidentMessageAsReadSubscription as onCreateIncidentMessageAsReadSubscriptionQuery,
} from '../../appsync-service/graphql/subscriptions'
import { addNewIncidentMessage } from '../../stores/ReduxStores/dashboard/incidentMessages'

class Incidents extends React.Component {
  static propTypes = {
    customIncidentTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
    incidents: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    closedIncidentCount: PropTypes.number.isRequired,
    geofences: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    staffGroups: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object))
      .isRequired,
    event: PropTypes.instanceOf(Parse.Object),
    dispatch: PropTypes.func.isRequired,
    groupIconSrc: PropTypes.string,
    dashboardFilterValue: PropTypes.string,
    incidentsLoading: PropTypes.bool.isRequired,
    openedIncidentId: PropTypes.string,
    currentUser: PropTypes.instanceOf(Parse.User).isRequired,
  }

  static defaultProps = {
    event: null,
    groupIconSrc: '',
    dashboardFilterValue: '',
  }

  constructor() {
    super()
    this.state = {
      filter: { label: 'All', value: '' },
      checkIncidents: false,
      audio: new Audio(incident_sound),
      isTriagingEnabled: false,
      incidentsShowMode: 'normal',
      normalIncidentCount: 0,
    }

    this.createIncidentSubscription = null
    this.updateIncidentSubscription = null
    this.createIncidentMessage = null
    this.createMarkIncidentAsRead = null
    this.createIncidentMessageAsRead = null
    this.refreshLiveIncidents = null
  }
  componentDidMount() {
    this.props.dispatch(loadEventGeofences())
    this.props.dispatch(loadStaffGroups())
    this.props.dispatch(loadIncidents())
  }

  loadSubscriptions = () => {
    this.onCreateIncidentSubscription()
    this.onUpdateIncidentSubscription()
    this.onCreateIncidentMessageSubscription()
    this.onCreateMarkIncidentAsReadSubscription()
    this.onCreateIncidentMessageAsReadSubscription()

    this.setRefreshLiveIncidents()
  }

  componentDidUpdate(prevProps) {
    const { incidents } = this.props

    if (prevProps.incidents.length === 0 && incidents.length > 0) {
      this.setData()
      this.loadSubscriptions()
    }
  }

  // componentWillUnmount() {
  // this.createIncidentSubscription.unsubscribe()
  // this.updateIncidentSubscription.unsubscribe()
  // this.createIncidentMessage.unsubscribe()
  // this.createMarkIncidentAsRead.unsubscribe()
  // this.createIncidentMessageAsRead.unsubscribe()
  // clearTimeout(this.refreshLiveIncidents)
  // }

  // Refresh the Incidents View rendomly between (20 - 30) sec
  setRefreshLiveIncidents = delayTimeSec => {
    if (!delayTimeSec) delayTimeSec = Math.random() * (30 - 20) + 20

    this.refreshLiveIncidents = setTimeout(() => {
      const { dispatch, liveIncidents } = this.props
      const updatedLiveIncidents = [...liveIncidents]
      dispatch(setLiveIncidents(updatedLiveIncidents))

      delayTimeSec = Math.random() * (30 - 20) + 20
      this.setRefreshLiveIncidents(delayTimeSec)
    }, delayTimeSec * 1000)
  }

  setData = () => {
    const {
      currentUser,
      incidents,
      closedIncidents,
      event,
      geofence,
      staffGroup,
      staffGroups,
    } = this.props

    const incidentsList =
      this.state.incidentsShowMode === 'normal' ? incidents : closedIncidents

    const filteredIncidents =
      geofence || staffGroup
        ? utils.sort(
            incidentsList.filter(
              dashboardUtils.filterIncidentsByGeofenceOrUserGroup(
                geofence,
                staffGroup,
              ),
            ),
            incident => incident.created_at,
            'desc',
          )
        : currentUser.permission_role === USER_PERMISSIONS.TargetedDashboardUser
        ? [
            ...new Set([
              ...incidentsList.filter(incident =>
                incident.triaging_allowed_users.includes(currentUser.object_id),
              ),
              ...dashboardUtils.filterIncidentsByUserGroups(
                staffGroups,
                incidentsList,
              ),
            ]),
          ]
        : utils.sort(incidentsList, incident => incident.created_at, 'desc')

    const liveIncidents = filteredIncidents

    const incidentTypes = liveIncidents
      .map(incident => incident.type_value)
      .filter((value, index, array) => array.indexOf(value) === index)

    const { dispatch } = this.props
    dispatch(setLiveIncidents(liveIncidents))
    dispatch(setLiveIncidentTypes(incidentTypes))
  }

  setNewData = incident => {
    const { dispatch, liveIncidents, liveIncidentTypes } = this.props

    let updatedLiveIncidents = [
      { ...incident, id: incident.object_id },
      ...liveIncidents,
    ]

    let isNewIncidentType = false
    if (!liveIncidentTypes.includes(incident.type_value)) {
      isNewIncidentType = true
    }

    dispatch(setLiveIncidents(updatedLiveIncidents))
    dispatch(
      setLiveIncidentTypes(
        isNewIncidentType
          ? [...liveIncidentTypes, incident.type_value]
          : liveIncidentTypes,
      ),
    )
  }

  setUpdatedData = incident => {
    let isArchived = incident.archived

    const { liveIncidents, incidents, dispatch } = this.props

    let indexInIncidents = incidents.findIndex(
      inc => inc.object_id === incident.object_id,
    )

    if (indexInIncidents === -1) {
      return this.setNewData(incident)
    }

    if (!isArchived) dispatch(setUpdatedIncident(incident))
    else dispatch(removeIncident(incident))

    let indexInLiveIncidents = liveIncidents.findIndex(
      inc => inc.object_id === incident.object_id,
    )
    if (indexInLiveIncidents === -1) return

    let updatedLiveIncidents = [...liveIncidents]

    if (!isArchived) updatedLiveIncidents[indexInLiveIncidents] = incident
    else updatedLiveIncidents.splice(indexInLiveIncidents, 1)

    dispatch(setLiveIncidents(updatedLiveIncidents))
  }

  async onUpdateIncidentSubscription() {
    this.updateIncidentSubscription = client
      .subscribe({
        query: onUpdateIncidentSubscriptionQuery,
      })
      .subscribe({
        next: async ({ data }) => {
          let incident = data.onUpdateIncident?.item
          if (!incident) return
          if (!incident.object_id) return

          let event = this.props.event
          if (incident.event?.object_id !== event?.object_id) return

          incident = formatIncident(incident)

          this.setUpdatedData(incident)
        },

        error: error =>
          console.log('error onUpdateIncidentSubscription::', error),
      })
  }

  async onCreateIncidentSubscription() {
    this.createIncidentSubscription = client
      .subscribe({
        query: onCreateIncidentSubscriptionQuery,
      })
      .subscribe({
        next: async ({ data }) => {
          let incident = data.onCreateIncident?.item
          if (!incident) return
          if (!incident.object_id) return

          let event = this.props.event
          if (incident.event?.object_id !== event?.object_id) return

          if (incident.archived) return

          let currentUser = this.props.currentUser
          // if (incident.reported_by?.object_id === currentUser.object_id) return

          incident = formatIncident(incident)

          this.props.dispatch(addNewIncident(incident))
          this.state.audio.play()

          if (incident.reported_by?.object_id === currentUser.object_id) {
            this.props.dispatch(notify('Incident Created Successfully'))
          } else {
            this.props.dispatch(notify('New Incident Occured, Please Review'))
          }

          this.setNewData(incident)
        },
        error: error =>
          console.log('error onCreateIncidentSubscription::', error),
      })
  }

  onCreateIncidentMessageSubscription = async () => {
    this.createIncidentMessage = client
      .subscribe({
        query: onCreateIncidentMessageSubscriptionQuery,
      })
      .subscribe({
        next: async ({ data }) => {
          let message = data.onCreateIncidentMessage?.item
          if (!message) return
          if (!message.object_id) return
          if (!message.incident) return
          if (!message.incident?.event) return

          const {
            dispatch,
            liveIncidents,
            currentUser,
            event,
            openedIncidentId,
          } = this.props

          let eventId = message.incident?.event.object_id
          if (eventId !== event.object_id) return

          let updatedLiveIncidents = [...liveIncidents]

          let incidentId = message.incident?.object_id
          dispatch(addNewIncidentMessage(message, incidentId))

          let indexInLiveIncidents = updatedLiveIncidents.findIndex(
            inc => inc.object_id === incidentId,
          )
          if (indexInLiveIncidents === -1) return

          let incident = updatedLiveIncidents[indexInLiveIncidents]

          incident.incident_messages = [
            ...incident.incident_messages,
            message.object_id,
          ]

          if (
            openedIncidentId === incidentId &&
            message.user?.object_id === currentUser.object_id
          ) {
            // dispatch(markIncidentMessageAsRead(incident, currentUser))

            incident.message_read_list = [
              ...incident.message_read_list,
              currentUser.object_id,
            ]
          } else {
            let message_read_list = [...incident.message_read_list]

            // Check if created user's object_id is existed in message_read_list
            // If not then push the object_id in message_read_list
            let messageCreatedBy = message.created_by.object_id
            if (!message_read_list.includes(messageCreatedBy)) {
              message_read_list.push(messageCreatedBy)
            }

            let index = message_read_list.findIndex(
              id => id === currentUser.object_id,
            )
            if (index !== -1) {
              message_read_list.splice(index, 1)
            }

            incident.message_read_list = message_read_list
            incident.last_message_created_at = message.created_at
          }

          updatedLiveIncidents[indexInLiveIncidents] = incident

          dispatch(setLiveIncidents(updatedLiveIncidents))
        },

        error: error =>
          console.log('error onCreateIncidentMessageSubscription::', error),
      })
  }

  async onCreateMarkIncidentAsReadSubscription() {
    this.createMarkIncidentAsRead = client
      .subscribe({
        query: onCreateMarkIncidentAsReadSubscriptionQuery,
      })
      .subscribe({
        next: async ({ data }) => {
          let incident = data.onCreateMarkIncidentAsRead?.item
          if (!incident) return
          if (!incident.object_id) return

          let event = this.props.event
          if (incident.event?.object_id !== event?.object_id) return

          incident = formatIncident(incident)

          this.setUpdatedData(incident)
        },

        error: error =>
          console.log('error onCreateMarkIncidentAsReadSubscription::', error),
      })
  }

  async onCreateIncidentMessageAsReadSubscription() {
    this.createIncidentMessageAsRead = client
      .subscribe({
        query: onCreateIncidentMessageAsReadSubscriptionQuery,
      })
      .subscribe({
        next: async ({ data }) => {
          let incident = data.onCreateIncidentMessageAsRead?.item

          if (!incident) return
          if (!incident.object_id) return

          let event = this.props.event
          if (incident.event?.object_id !== event?.object_id) return

          incident = formatIncident(incident)

          this.setUpdatedData(incident)
        },

        error: error =>
          console.log(
            'error onCreateIncidentMessageAsReadSubscription::',
            error,
          ),
      })
  }

  handleGroupFilterChange(geofenceOrUsergroup) {
    const [type, id] = geofenceOrUsergroup.split(':')

    switch (type) {
      case 'geofence':
        this.props.dispatch(setGeofenceFilter(id))
        break
      case 'group':
        this.props.dispatch(setGroupFilter(id))
        break
      case '':
        this.props.dispatch(resetFilters())
        break
      default:
        console.log('handleGroupFilterChange', { type, id })
        break
    }
  }

  handleIncidentCardClick = incidentsShowMode => {
    this.setState({ incidentsShowMode }, () => {
      this.setData()
    })
  }

  render() {
    const {
      customIncidentTypes,
      closedIncidentCount,
      geofences,
      staffGroups,
      event,
      groupIconSrc,
      dashboardFilterValue,
      incidentsLoading,
      currentUser,
      incidentsTableData,
      liveIncidents,
      liveIncidentTypes,
    } = this.props
    const { incidentsShowMode } = this.state

    // const filteredIncident = liveIncidents.filter(
    //   incident =>
    //     incident.type_value === this.state.filter.value ||
    //     this.state.filter.value === '',
    // )

    /*var test
    if(incidents.length > 0){
      console.log(incidents)
      incidents.forEach(incident => {
        test = incident.user_views.filter(
          userView => userView.user && userView.user === currentUser.object_id,
        )
      });
    console.log({test})
    }*/

    return (
      <section className="incidents">
        <div className="incidents__header">
          <NumberCard
            count={liveIncidents.length}
            subtitle="Incidents"
            onClick={() => this.handleIncidentCardClick('normal')}
          />
          <NumberCard
            loading={false}
            count={closedIncidentCount}
            subtitle="Closed Incidents"
            dark
            onClick={() => this.handleIncidentCardClick('closed')}
          />
          {!event ? (
            <Loading />
          ) : (
            <>
              {utils.hasDashboardFiltering(event) ||
              utils.hasPermission(currentUser, [
                USER_PERMISSIONS.TargetedDashboardUser,
              ]) ? (
                <Card>
                  {groupIconSrc && (
                    <div>{<img src={groupIconSrc} alt="" />}</div>
                  )}
                  <div>
                    <p className="incidents__header__label">Filter by:</p>
                    <DashboardGroupFilter
                      onChange={val => this.handleGroupFilterChange(val)}
                      geofences={geofences}
                      staffGroups={staffGroups}
                      value={dashboardFilterValue}
                    />
                  </div>
                </Card>
              ) : (
                <CapacityView />
              )}
            </>
          )}
        </div>
        <div className="incidents__content">
          <div className="incidents__content__header">
            <span>
              {incidentsShowMode === 'normal'
                ? 'Incidents'
                : 'Closed Incidents'}
            </span>
            <DashboardSelect
              options={[
                { value: '', label: 'All' },
                ...liveIncidentTypes.map(incidentType => ({
                  value: incidentType,
                  label: utils.getIncidentName(
                    incidentType,
                    customIncidentTypes,
                  ),
                })),
              ]}
              onChange={option => {
                this.setState({ filter: option })
              }}
              value={this.state.filter}
            />
          </div>
          <hr />
          <div className="incidents__content__list">
            <IncidentTable
              incidents={liveIncidents}
              filter={this.state.filter}
              customIncidentTypes={customIncidentTypes}
              dispatch={this.props.dispatch}
              onClick={incidentId => {
                this.props.dispatch(openIncidentView(incidentId))
              }}
            />
            {incidentsTableData.length === 0 &&
              !incidentsLoading &&
              'No Incidents'}
            {incidentsLoading && <Loading />}
          </div>
        </div>
      </section>
    )
  }
}

export default compose(
  withUserContext,
  connect(state => {
    const {
      auth: { currentUser },
    } = state
    const { geofenceIdFilter, groupIdFilter } = state.dashboard

    const geofences = state.eventGeofences.list

    const geofence = utils.getDataById(geofences, geofenceIdFilter)

    const staffGroups = state.staffGroups.list

    const staffGroup = staffGroups.find(
      ({ object_id }) => object_id === groupIdFilter,
    )
    const closedIncidentsArr = Object.values(state.incidents.closedIncidentList)
    const incidentsArr = Object.values(state.incidents.data)
    return {
      currentUser,
      customIncidentTypes: state.incidentForm.incidents.filter(form =>
        form.type.startsWith('custom'),
      ),
      geofence,
      geofences,
      staffGroup,
      staffGroups,
      openedIncidentId: state.dashboard.openedIncidentId,
      closedIncidents: closedIncidentsArr,
      incidents: incidentsArr,
      liveIncidents: state.incidents.liveIncidents,
      liveIncidentTypes: state.incidents.liveIncidentTypes,
      closedIncidentCount: state.incidents.closedIncidentCount,
      incidentsLoading: state.incidents.status === 'loading',
      event: state.currentEvent.event,
      incidentsTableData: state.incidents.tableData,
      groupIconSrc:
        staffGroup && staffGroup.icon_file && staffGroup.icon_file.url,
      dashboardFilterValue:
        (state.dashboard.groupIdFilter &&
          `group:${state.dashboard.groupIdFilter}`) ||
        (state.dashboard.geofenceIdFilter &&
          `geofence:${state.dashboard.geofenceIdFilter}`) ||
        '',
    }
  }),
)(Incidents)
