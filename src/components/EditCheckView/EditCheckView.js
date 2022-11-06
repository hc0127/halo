import React, { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Parse from 'parse'
import Loading from '../common/Loading/Loading'
import Title from '../common/Title/Title'
import Button from '../common/Button/Button'
import { closeSlidingView } from '../../stores/ReduxStores/dashboard/dashboard'
import ClickableDiv from '../ClickableDiv'
import utils from '../../utils/helpers'
import { CHECK_STATUS, VARIANT } from '../../utils/constants'
import {
  completeCheck,
  reopenCheck,
} from '../../stores/ReduxStores/dashboard/eventChecks'
import DashboardButton from '../DashboardButton'
import EditCheckViewDetails from './EditCheckViewDetails'
import EditCheckViewUpdates from './EditCheckViewUpdates'

const propTypes = {
  check: PropTypes.instanceOf(Parse.Object).isRequired,
  dispatch: PropTypes.func.isRequired,
}

const TABS = {
  Details: 'Details',
  Updates: 'Updates',
}

const EditCheckView = ({ check, dispatch }) => {
  const [openTab, setOpenTab] = useState('Details')

  const checkId = check ? check.object_id : null

  useEffect(() => {
    setOpenTab(TABS.Details)
    return () => {}
  }, [checkId])

  const adminCheck = useMemo(() => {
    return check ? check.admin_check : null
  }, [check])

  if (!check) {
    return (
      <section className="edit-check-view">
        <Loading />
      </section>
    )
  }

  const status = utils.getEventCheckStatus(check)
  const canCompleteCheck = [
    CHECK_STATUS.Pending,
    CHECK_STATUS.Late,
    CHECK_STATUS.UnableToComplete,
  ].includes(status)
  const canReopenCheck = [CHECK_STATUS.Complete].includes(status)

  return (
    <section className="edit-check-view">
      <div className="edit-check-view__header">
        <div>
          <Title type="h3">{adminCheck.title}</Title>

          <div className="edit-check-view__header__description">
            {adminCheck.description}
          </div>
        </div>

        <Button onClick={() => dispatch(closeSlidingView())} type="close">
          <span>&times;</span>
        </Button>
      </div>
      <div className="edit-check-view__actions">
        <div className="edit-check-view__tabs">
          {Object.keys(TABS).map(tab => (
            <ClickableDiv key={tab} onClick={() => setOpenTab(tab)}>
              <div
                className={utils.makeClass(
                  'edit-check-view__tab',
                  openTab === tab && 'active',
                )}
              >
                {TABS[tab]}
              </div>
            </ClickableDiv>
          ))}
        </div>
        <div className="edit-check-view__buttons">
          {canReopenCheck ? (
            <DashboardButton
              variant={VARIANT.Secondary}
              onClick={() => dispatch(reopenCheck(check))}
            >
              Re-open Tasks
            </DashboardButton>
          ) : null}

          {canCompleteCheck ? (
            <DashboardButton
              variant={VARIANT.Primary}
              onClick={() => dispatch(completeCheck(check))}
            >
              Complete Check
            </DashboardButton>
          ) : null}
        </div>
      </div>
      <div className="edit-check-view__content">
        {openTab === TABS.Details ? <EditCheckViewDetails /> : null}
        {openTab === TABS.Updates ? <EditCheckViewUpdates /> : null}
      </div>
    </section>
  )
}

EditCheckView.propTypes = propTypes

EditCheckView.defaultProps = {}

export default connect(state => ({
  check: state.eventChecks.data[state.dashboard.openedCheckId],
}))(EditCheckView)
