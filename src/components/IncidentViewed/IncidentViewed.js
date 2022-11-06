import React, { useState, useEffect } from 'react'
import Parse from 'parse'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'

import { SearchInput } from '../AdminTable'
import { Loading } from './../common'
import utils from '../../utils/helpers'
import { CLIENT_FEATURES } from '../../utils/constants'
import {
  getUserViews,
  getLoading,
  loadUserViews,
} from '../../stores/ReduxStores/dashboard/userViews'
import IncidentUserView from './IncidentUserView'

const propTypes = {
  staff: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  incident: PropTypes.instanceOf(Parse.Object).isRequired,
  event: PropTypes.instanceOf(Parse.Object).isRequired,
  userViews: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
}

const IncidentViewed = ({
  staff,
  incident,
  event,
  userViews,
  dispatch,
  loading,
}) => {
  const userViewCount = incident.user_views.length

  useEffect(() => {
    dispatch(loadUserViews(incident.id))
    return () => {}
  }, [dispatch, incident.id, userViewCount])

  const [search, setSearch] = useState('')

  const isTriagingEnabled = utils.hasFeature(
    event,
    CLIENT_FEATURES.IncidentTriaging,
  )

  let filteredStaff = isTriagingEnabled
    ? incident.triaging_allowed_users
    : staff

  userViews.forEach(userView => {
    const userViewUser = userView.user
    if (
      userViewUser &&
      !filteredStaff.find(user => userViewUser.object_id === user.object_id)
    ) {
      filteredStaff.push(userViewUser)
    }
  })

  filteredStaff = filteredStaff.filter(
    user =>
      search.length === 0 ||
      user.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="incident-viewed">
      <div className="form-group">
        <SearchInput placeholder="Search" value={search} onChange={setSearch} />
      </div>
      <ul className="incident-viewed__users">
        {loading ? (
          <Loading centered />
        ) : (
          filteredStaff.map(user => {
            const view = userViews.find(
              userView => userView.user?.object_id === user.object_id,
            )

            return (
              <IncidentUserView key={user.object_id} user={user} view={view} />
            )
          })
        )}
        {staff.length === 0 && (
          <li className="incident-viewed__user">No staff added to event</li>
        )}
      </ul>
    </div>
  )
}

IncidentViewed.propTypes = propTypes
IncidentViewed.defaultProps = {}

export default compose(
  connect((state, props) => ({
    userViews: getUserViews(state, props.incident.id),
    loading: getLoading(state),
  })),
)(IncidentViewed)
