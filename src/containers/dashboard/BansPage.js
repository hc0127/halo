import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import { compose } from 'redux'

import { deleteBan } from '../../stores/ReduxStores/dashboard/eventBans'
import { cacheEventId } from '../../stores/ReduxStores/dashboard/currentEvent'
import BanList from '../../components/BanList/BanList'
import {
  DashboardSlidingPanel,
  DashboardDialogPanel,
} from '../../components/Dashboard'
import { openEditBanForm } from '../../stores/ReduxStores/dashboard/dashboard'

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({ id: PropTypes.string.isRequired }),
  }).isRequired,
  // bans: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  dispatch: PropTypes.func.isRequired,
  permission_role: PropTypes.string,
}

const BansPage = ({ dispatch, match, permission_role }) => {
  useEffect(() => {
    dispatch(cacheEventId(match.params.id))
    return () => {}
  }, [dispatch, match.params.id])

  return (
    <div className="bans-page">
      <DashboardSlidingPanel />
      <DashboardDialogPanel />
      <BanList
        permission={permission_role}
        onEdit={banId => dispatch(openEditBanForm(banId))}
        onDelete={banId => dispatch(deleteBan(banId))}
      />
    </div>
  )
}

BansPage.propTypes = propTypes

BansPage.defaultProps = {}

export default compose(
  connect(state => ({
    permission_role: state.auth.currentUser.permission_role,
  })),
)(BansPage)
