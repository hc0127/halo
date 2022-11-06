import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import utils from '../../utils/helpers'
import Card from '../Card'
import ClickableDiv from '../ClickableDiv'
import moment from 'moment'
import { connect } from 'react-redux'
import { CHECK_TYPE_TEXT } from '../../utils/constants'
import Icon from '../common/Icon/Icon'
import { openEditCheckView } from '../../stores/ReduxStores/dashboard/dashboard'
import iconUser from '../../images/icons/icon-user-dark.svg'
import iconMarker from '../../images/icons/icon-marker.svg'
import iconClock from '../../images/icons/icon-clock.svg'
import { compose } from 'redux'
import { withUserContext } from '../../Contexts'

const propTypes = {
  currentUser: PropTypes.instanceOf(Parse.Object).isRequired,
  dispatch: PropTypes.func.isRequired,
  staff: PropTypes.objectOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  check: PropTypes.instanceOf(Parse.Object).isRequired,
}

const DashboardCheckListItem = ({ currentUser, dispatch, check, staff }) => {
  const adminCheck = check.admin_check

  const onClick = useCallback(() => {
    dispatch(openEditCheckView(check.object_id))
  }, [dispatch, check])

  if (!adminCheck) {
    return null
  }

  const assignees = check.users.map(id => staff[id])
  const assigneesText = utils.getCheckAssigneesText(assignees)

  const status = utils.getEventCheckStatus(check)
  const isUnseen = utils.isEventCheckUnseen(check, currentUser)

  return (
    <div
      className={utils.makeClass(
        'check-list__item',
        status,
        isUnseen ? 'unseen' : null,
      )}
    >
      <Card>
        <ClickableDiv onClick={onClick}>
          <div className="check-list__item__container">
            <div className="check-list__item__details">
              <div className="check-list__item__title">{adminCheck.title}</div>
              <div className="check-list__item__excerpts">
                <div className="check-list__item__excerpt">
                  <Icon src={iconUser} size={16} />
                  {assigneesText}
                </div>
                <div className="check-list__item__excerpt">
                  <Icon src={iconMarker} size={16} />
                  {adminCheck.zones.join(', ') || 'No zone'}
                </div>
              </div>
            </div>
            <div className="check-list__item__footer">
              <div className="check-list__item__time">
                <Icon src={iconClock} size={16} />
                {moment.utc(check.occurs_at).time()}
              </div>
              <div className="check-list__item__type">
                {CHECK_TYPE_TEXT[adminCheck.type]}
              </div>
            </div>
          </div>
        </ClickableDiv>
      </Card>
    </div>
  )
}

DashboardCheckListItem.propTypes = propTypes

DashboardCheckListItem.defaultProps = {}

export default compose(
  withUserContext,
  connect(state => ({ staff: state.staff.data })),
)(DashboardCheckListItem)
