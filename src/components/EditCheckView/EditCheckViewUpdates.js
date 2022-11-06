import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Parse from 'parse'
import utils from '../../utils/helpers'
import moment from 'moment'
import { ChatIcon, Heading, Loading } from '../common'

import DashboardButton from '../DashboardButton'
import { useIsBottomScrolled, useInterval } from '../../utils/customHooks'
import { compose } from 'redux'
import { withUserContext } from '../../Contexts'
import EditCheckViewUpdatesMessageListItem from './EditCheckViewUpdatesMessageListItem'
import {
  addEventCheckMessage,
  fetchEventCheckMessages,
  getEventCheckMessagesLoading,
  loadEventCheckMessages,
  reloadEventCheckMessages,
  markMessageAsRead,
} from '../../stores/ReduxStores/dashboard/eventCheckMessages'
import { CHECK_STATUS } from '../../utils/constants'

const propTypes = {
  currentUser: PropTypes.instanceOf(Parse.Object).isRequired,
  check: PropTypes.instanceOf(Parse.Object).isRequired,
  checkId: PropTypes.any,
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)),
}

const defaultProps = {
  checkId: '',
  messages: [],
}

const EditCheckViewUpdates = ({
  currentUser,
  check,
  checkId,
  dispatch,
  loading,
  messages,
}) => {
  const [isReminderVisible, containerRef] = useIsBottomScrolled(loading)
  const [messageText, setMessageText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const messageCount = check.messages?.length || 0

  useEffect(() => {
    dispatch(loadEventCheckMessages(check.object_id))
    dispatch(markMessageAsRead(check.object_id))
  }, [dispatch, check.object_id, messageCount])

  useInterval(() => {
    dispatch(reloadEventCheckMessages(check.object_id))
  }, 5000)

  useEffect(() => {
    setSubmitting(false)
  }, [messages])

  const messagesByDay = useMemo(() => {
    const byDay = {}
    if (!messages) {
      return []
    }

    messages.forEach(message => {
      const createdAt = moment.utc(message.sent_at)
      const date = createdAt.isSame(Date.now(), 'day')
        ? 'Today'
        : utils.formatDate(message.createdAt, 'dddd Do MMMM YYYY')

      if (!(date in byDay)) {
        byDay[date] = { date, messages: [] }
      }

      byDay[date].messages.push(message)
    })

    return Object.values(byDay)
  }, [messages])

  const sendMessage = useCallback(() => {
    if (!messageText.trim()) {
      return
    }

    setSubmitting(true)
    setMessageText('')

    dispatch(
      addEventCheckMessage({
        eventCheckId: check.object_id,
        message: messageText.trim(),
        userId: currentUser.object_id,
      }),
    )
  }, [
    dispatch,
    setSubmitting,
    messageText,
    setMessageText,
    check,
    currentUser.object_id,
  ])

  const submit = e => {
    e.preventDefault()
    sendMessage()
  }

  const onKeyDown = e => {
    if (e.key === 'Enter') {
      submit(e)
    }
  }

  const isComplete = check.status === CHECK_STATUS.Complete

  return (
    <div className="edit-check-view__updates">
      <div className="edit-check-view__updates__messages">
        <div
          className="edit-check-view__updates__messages__container"
          ref={containerRef}
        >
          {!checkId || checkId !== check.object_id || loading ? (
            <Loading centered />
          ) : (
            messagesByDay.map(day => (
              <div
                key={day.date}
                className="edit-check-view__updates__messages__day-group"
              >
                <span className="edit-check-view__updates__messages__date-container">
                  <hr />
                  <span className="edit-check-view__updates__messages__date">
                    {day.date}
                  </span>
                </span>
                {day.messages.map(message => (
                  <EditCheckViewUpdatesMessageListItem
                    key={message.object_id || message._localId}
                    message={message}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            ))
          )}
        </div>
        <div
          className={utils.makeClass(
            'edit-check-view__updates__messages__reminder',
            isReminderVisible && 'visible',
          )}
        >
          More messages below
        </div>
      </div>
      <div className="edit-check-view__updates__inputMessage">
        <form onSubmit={submit}>
          <div className="edit-check-view__updates__inputMessage__header">
            <Heading text="Add an update to this check" size="h4" />
          </div>
          <div className="edit-check-view__updates__inputMessage__input">
            <ChatIcon name={currentUser.name} />
            <textarea
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={onKeyDown}
              className="edit-check-view__updates__inputMessage__input-textarea"
              placeholder="Enter update"
              disabled={isComplete}
            />
          </div>
          <div className="edit-check-view__updates__inputMessage__submit">
            <DashboardButton
              disabled={!messageText || submitting || isComplete}
            >
              Add Update
            </DashboardButton>
          </div>
        </form>
      </div>
    </div>
  )
}

EditCheckViewUpdates.propTypes = propTypes

EditCheckViewUpdates.defaultProps = defaultProps

export default compose(
  withUserContext,
  connect(state => ({
    check: state.eventChecks.data[state.dashboard.openedCheckId],
    checkId: state.eventCheckMessages.checkId,
    messages: fetchEventCheckMessages(state, state.dashboard.openedCheckId),
    loading: getEventCheckMessagesLoading(state),
  })),
)(EditCheckViewUpdates)
