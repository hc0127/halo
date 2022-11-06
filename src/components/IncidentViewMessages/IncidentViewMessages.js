import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Icon, Heading, ChatIcon, Loading } from '../common'
import { getIcon } from '../../stores/IconStore'
import DashboardButton from '../DashboardButton'
import { withUserContext } from '../../Contexts'
import utils from '../../utils/helpers'
import {
  INCIDENT_STATUS_FOR_USER as STATUS_FOR_USER,
  BG_COLORS_INCIDENT_STATUS_FOR_USER as BG_COLORS,
} from '../../utils/constants'
import {
  loadMessages,
  reloadMessages,
  getIncidentMessagesList,
  getLoading,
} from '../../stores/ReduxStores/dashboard/incidentMessages'
import IncidentMessageListItem from '../IncidentMessageListItem'
import {
  markIncidentMessageAsRead,
  updateIncidentTable,
} from '../../stores/ReduxStores/dashboard/incidents'
import { useIsBottomScrolled, useInterval } from '../../utils/customHooks'

const propTypes = {
  incidentMessagesByDay: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)),
  ).isRequired,
  messageText: PropTypes.string.isRequired,
  messageImage: PropTypes.instanceOf(Parse.User).isRequired,
  onMessageChange: PropTypes.func.isRequired,
  onMessageImageChange: PropTypes.func.isRequired,
  onMessageSubmit: PropTypes.func.isRequired,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
  incident: PropTypes.instanceOf(Parse.Object).isRequired,
  event: PropTypes.instanceOf(Parse.Object),
  dispatch: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  selectedTableIncident: PropTypes.instanceOf(Parse.Object),
}

const IncidentViewMessages = ({
  messageText,
  messageImage,
  onMessageChange,
  onMessageImageChange,
  onMessageSubmit,
  currentUser,
  incident,
  dispatch,
  loading,
  event,
  incidentMessagesByDay,
  selectedTableIncident,
}) => {
  // mark messages as read for new incidents
  useEffect(() => {
    dispatch(markIncidentMessageAsRead(incident, currentUser))
    return () => {}
  }, [dispatch, incident, currentUser])

  useEffect(() => {
    if (selectedTableIncident?.userStatus === STATUS_FOR_USER.UpdateNotViewed) {
      dispatch(
        updateIncidentTable({
          id: selectedTableIncident.id,
          updatedFields: {
            userStatus: STATUS_FOR_USER.Default,
            rowBgColor: BG_COLORS.Color_Default,
          },
        }),
      )
    }
  }, [dispatch, selectedTableIncident])

  const [isReminderVisible, containerRef] = useIsBottomScrolled(loading)

  // const messageCount = incident.incident_messages.length

  // load messages
  useEffect(() => {
    if (Object.keys(incidentMessagesByDay).length === 0)
      dispatch(loadMessages(incident.id))
    return () => {}
  }, [])

  // useInterval(() => {
  //   dispatch(reloadMessages(incident.id))
  // }, 5000)

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => setSubmitting(false), [messageText])

  const sendMessage = () => {
    if (messageText === '' && !messageImage) {
      return
    }
    setSubmitting(true)
    onMessageSubmit()
  }

  return (
    <div className="IncidentViewMessages">
      <div className="IncidentViewMessages__messages">
        <div
          className="IncidentViewMessages__messages__container"
          ref={containerRef}
        >
          {loading ? (
            <Loading centered />
          ) : (
            Object.keys(incidentMessagesByDay).map(day => (
              <div
                key={day}
                className="IncidentViewMessages__messages__day-group"
              >
                <span className="IncidentViewMessages__messages__date-container">
                  <hr />
                  <span className="IncidentViewMessages__messages__date">
                    {day}
                  </span>
                </span>
                {incidentMessagesByDay[day].map(incidentMessage => (
                  <IncidentMessageListItem
                    key={incidentMessage.object_id}
                    incidentMessage={incidentMessage}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            ))
          )}
        </div>
        <div
          className={utils.makeClass(
            'IncidentViewMessages__messages__reminder',
            isReminderVisible && 'visible',
          )}
        >
          More updates below
        </div>
      </div>
      <div className="IncidentViewMessages__inputMessage">
        <form
          onSubmit={e => {
            e.preventDefault()
            sendMessage()
          }}
        >
          <div className="IncidentViewMessages__inputMessage__header">
            <Heading text="Add an update to this incident" size="h4" />
          </div>
          <div className="IncidentViewMessages__inputMessage__input">
            <ChatIcon name={currentUser.name} />
            <textarea
              value={messageText}
              onChange={e => {
                onMessageChange(e.target.value)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              className="IncidentViewMessages__inputMessage__input-textarea"
              disabled={incident.archived}
            />
            <div className="IncidentViewMessages__inputMessage__input-imageInput">
              <label for="imageInput">
                <i>
                  <Icon
                    src={getIcon('image')}
                    size={30}
                    style={{ cursor: 'pointer' }}
                  />
                </i>
              </label>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => onMessageImageChange(e.target.files[0])}
                onClick={e => {
                  e.target.value = null
                }}
              />
            </div>
          </div>
          {messageImage && (
            <div className="IncidentViewMessages__inputMessage__imagePreview">
              <img src={URL.createObjectURL(messageImage)} alt="image" />
              <i onClick={() => onMessageImageChange(null)}>
                <Icon src={getIcon('cross_white')} size={15} />
              </i>
            </div>
          )}

          <div className="IncidentViewMessages__inputMessage__submit">
            <DashboardButton
              disabled={(!messageText && !messageImage) || submitting}
            >
              Add Update
            </DashboardButton>
          </div>
        </form>
      </div>
    </div>
  )
}

IncidentViewMessages.propTypes = propTypes

IncidentViewMessages.defaultProps = {}

export default compose(
  withUserContext,
  connect((state, props) => ({
    incidentMessagesByDay: getIncidentMessagesList(state, props.incident.id),
    loading: getLoading(state),
    selectedTableIncident: state.incidents.selectedTableIncident,
    event: state.currentEvent.event,
  })),
)(IncidentViewMessages)
