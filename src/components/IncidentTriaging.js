import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import { compose } from 'redux'

import Card from './Card'
import Title from './common/Title/Title'
import IncidentTriagingListItem from './IncidentTriagingListItem'
import utils from '../utils/helpers'

import { openIncidentView } from '../stores/ReduxStores/dashboard/dashboard'
import { loadIncidents } from '../stores/ReduxStores/dashboard/incidents'

import { useInterval } from '../utils/customHooks'

import dashboardUtils from '../utils/dashboardFilterHelpers'

import { USER_PERMISSIONS } from '../utils/constants'

const propTypes = {
  incidents: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  isTriagingEnabled: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
}

const IncidentTriaging = ({ incidents, isTriagingEnabled, dispatch }) => {
  // useInterval(() => {
  //   dispatch(loadIncidents())
  // }, 5000)

  return (
    <>
      {isTriagingEnabled && incidents.length > 0 && (
        <section className="incident-triaging">
          <Card>
            <Title type="h3">Incident Triage</Title>
            <div className="incident-triaging__list">
              {incidents.map(incident => (
                <IncidentTriagingListItem
                  key={incident.id}
                  incident={incident}
                  onClick={() => dispatch(openIncidentView(incident.id))}
                />
              ))}
            </div>
          </Card>
        </section>
      )}
    </>
  )
}

IncidentTriaging.propTypes = propTypes

IncidentTriaging.defaultProps = {}

export default compose(
  connect(state => {
    const {
      staffGroups,
      auth: { currentUser },
    } = state
    const { event } = state.currentEvent

    const isTriagingEnabled = utils.hasIncidentTriaging(event)

    const sortedIncidents = utils.sort(
      Object.values(state.incidents.data).filter(
        incident => isTriagingEnabled && incident.triaged === false,
      ),
      incident => incident.created_at,
    )

    return {
      isTriagingEnabled,
      incidents:
        currentUser.permission_role === USER_PERMISSIONS.TargetedDashboardUser
          ? [
              ...dashboardUtils.filterIncidentsByUserGroups(
                staffGroups.list,
                sortedIncidents,
              ),
            ]
          : sortedIncidents,
    }
  }),
)(IncidentTriaging)
