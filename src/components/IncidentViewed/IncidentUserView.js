import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import moment from 'moment'

import { Icon, Loading } from './../common'
import { getIcon } from '../../stores/IconStore'
import utils from '../../utils/helpers'

const propTypes = {
  user: PropTypes.instanceOf(Parse.Object).isRequired,
  view: PropTypes.instanceOf(Parse.Object),
}

const IncidentUserView = ({ user, view }) => {
  const lUser = user

  if (!lUser) {
    return <Loading centered />
  }

  return (
    <li
      className={utils.makeClass(
        'incident-viewed__user',
        view ? 'read' : 'unread',
      )}
    >
      <Icon src={getIcon('tick')} size={30} />
      <div>
        <div className="incident-viewed__user__name">{lUser.name}</div>
        <div className="incident-viewed__user__seen-at">
          {view &&
            view.viewed_at &&
            `Seen At: ${moment(view.viewed_at).format('DD/MM/YYYY HH:mm')}`}
        </div>
      </div>
    </li>
  )
}

IncidentUserView.propTypes = propTypes

IncidentUserView.defaultProps = {
  view: null,
}

export default IncidentUserView
