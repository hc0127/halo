import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'

import { resetEvent } from '../../stores/ReduxStores/dashboard/currentEvent'
import { logout } from '../../stores/ReduxStores/auth'
import { withUserContext } from '../../Contexts'
import { TITLE_TYPES, USER_PERMISSIONS, VARIANT } from '../../utils/constants'

import Loading from '../../components/common/Loading/Loading'
import Card from './../../components/Card'
import Title from './../../components/common/Title/Title'
import { loadUserEvents } from '../../stores/ReduxStores/dashboard/userEvents'
import { AdminButton, AdminTempName } from '../../components/common/Admin'
import EventListButton from '../../components/common/EventListButton'
import utils from '../../utils/helpers'
import { createLog } from '../../api/logs';
import moment from 'moment';

class EventPage extends Component {
  static propTypes = {
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
    dispatch: PropTypes.func.isRequired,
    currentUser: PropTypes.instanceOf(Parse.User).isRequired,
    userEvents: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object))
      .isRequired,
    loading: PropTypes.bool.isRequired,
    suspended: PropTypes.bool.isRequired,
  }
  static defaultProps = {}

  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    this.props.dispatch(loadUserEvents())
    this.props.dispatch(resetEvent())
  }

  onEnterEvent = async event => {
    const { currentUser } = this.props
    // TEMP FIX MOB-3175
    // await createLog(event.object_id, {
    //   log_message: `${currentUser.name} has just logged in`,
    //   log_type: 'signin',
    // })
    setTimeout(() => {
      var newWindow = window.open()
      newWindow.location = `/dashboard/${event.object_id}`
    }, 500)
  }

  render() {
    const {
      history,
      currentUser,
      dispatch,
      userEvents,
      loading,
      suspended,
    } = this.props

    const isAdmin = utils.hasPermission(currentUser, [
      USER_PERMISSIONS.CrestAdmin,
      USER_PERMISSIONS.ClientManager,
    ])

    const hasDashboardAccess = utils.hasPermission(currentUser, [
      USER_PERMISSIONS.CrestAdmin,
      USER_PERMISSIONS.ClientManager,
      USER_PERMISSIONS.EventManager,
      USER_PERMISSIONS.TargetedDashboardUser,
    ])

    const suspendedMessage = isAdmin ? (
      <>
        Your account has been suspended. Please contact{' '}
        <a href="mailto:support@halosolutions.com">support@halosolutions.com</a>{' '}
        for more information.
      </>
    ) : (
      'Your account has been suspended. Please contact your administrator for more information.'
    )

    return (
      <div className="event-list-page">
        {!loading ? (
          <Card>
            {hasDashboardAccess ? (
              <>
                <Title type={TITLE_TYPES.h1}>Your events</Title>
                <div className="event-list-page__list">
                  {suspended ? (
                    suspendedMessage
                  ) : (
                    <>
                      {userEvents.filter(item => {
                        return moment().isBetween(
                          moment(item?.start_date),
                          moment(item?.end_date),
                        )
                      }).map(event => (
                        // TODO
                        // const startDate = event.get("startDate").toLocaleDateString("en-GB");
                        // const endDate = event.get("endDate").toLocaleDateString("en-GB");
                        // const dateString = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
                        <div className="event-list-page__event" key={event.id}>
                          <AdminTempName
                            name={event.title}
                            clientName={event.client.name}
                          />
                          <EventListButton
                            onClick={() => this.onEnterEvent(event)}
                          >
                            Dashboard
                          </EventListButton>
                        </div> 
                      ))}
                      {userEvents.length === 0 &&
                        'You are assigned to no events'}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div>Your account does not have access to the dashboard.</div>
            )}

            {isAdmin && !suspended && (
              <AdminButton onClick={() => history.push('/admin')}>
                Halo Hub
              </AdminButton>
            )}

            <AdminButton
              variant={VARIANT.Secondary}
              hollow
              onClick={() => {
                history.push('/login')
                dispatch(logout())
              }}
            >
              Logout
            </AdminButton>
          </Card>
        ) : (
          <Loading />
        )}
      </div>
    )
  }
}

export default withUserContext(
  connect(state => ({
    userEvents: state.userEvents.list,
    suspended: state.userEvents.suspended,
    loading: state.userEvents.status === 'loading',
  }))(EventPage),
)
