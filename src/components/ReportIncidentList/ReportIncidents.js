import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import { compose } from 'redux'
import moment from 'moment'
import utils from '../../utils/helpers'
import Loading from '../common/Loading/Loading'
import Image from '../common/Image/Image'
import IncidentTypeName from '../IncidentTypeName'

import { withUserContext } from '../../Contexts'

import { IncidentOrders } from '../../utils/incidentOrders'
import {
  getAllIncidentMessages,
  loadAllMessages,
} from '../../stores/ReduxStores/dashboard/incidentMessages'

const propTypes = {
  incidents: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  formFieldValues: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentUser: PropTypes.instanceOf(Parse.Object).isRequired,
  allIncidentMessages: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)),
  ).isRequired,
  incidentMessageLoading: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
}

const ReportIncidents = ({
  incidents,
  formFieldValues,
  currentUser,
  allIncidentMessages,
  incidentMessageLoading,
  dispatch,
}) => {
  useEffect(() => {
    dispatch(loadAllMessages())
    return () => {}
  }, [dispatch])

  // TODO: HANDLE LOADING IF NECESSARY
  if (incidentMessageLoading) {
    return <Loading />
  }

  return (
    <div>
      {incidents.map(incident => {
        let locationData = null

        const captureData = incident.capture_data
        const location = incident.location

        if (captureData.location) {
          locationData = captureData.location
        } else if (location) {
          locationData = location
        }

        if (!locationData) {
          locationData = {}
        }

        return (
          <table key={incident.id} className="incident">
            <thead>
              <tr>
                <th colSpan="3">
                  <span className="incidentHeader">
                    {incident.incident_code} -{' '}
                    <IncidentTypeName>{incident}</IncidentTypeName>
                  </span>
                  <span className="right">
                    {moment(incident.created_at)
                      .format('DD/MM/YYYY HH:mm')
                      .toLocaleString('en-GB')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th colSpan="2">Who</th>
                <td colSpan="2">
                  {incident.reported_by.name || 'Unknown'} -{' '}
                  {incident.reported_by.role || ''}
                </td>
              </tr>
              <tr>
                <th>What</th>
                <td colSpan="2">
                  {incident.img_file && (
                    <React.Fragment>
                      <Image
                        src={incident.img_file.url}
                        alt=""
                        style={{ height: 150 }}
                      />
                      <br />
                    </React.Fragment>
                  )}
                  {utils.getIncidentWhatText(incident)}
                </td>
              </tr>
              <tr>
                <th>Where</th>
                <td colSpan="2">
                  {!captureData.eventArea || captureData.eventArea === 'Null'
                    ? ''
                    : captureData.eventArea}
                  {locationData && (
                    <span>
                      <br />
                      {/* TODO add domain lock to the API key in the google developer console to prevent people from stealing the key / add in functionality to make the request in the backend */}
                      <img
                        src={`https://maps.googleapis.com/maps/api/staticmap?center=${locationData.latitude},${locationData.longitude}&zoom=14&size=250x250&maptype=roadmap&markers=color:red%7Ilabel:I%7C${locationData.latitude},${locationData.longitude}&key=AIzaSyBnOvtYtXW2OVevBs0R47mxdXdYiEQA3Po`}
                        alt={`${captureData.name ||
                          'unknown incident'} - incident map`}
                      />
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <th>Data</th>
                <td colSpan="2">
                  {(IncidentOrders[incident.type_value.toLowerCase()]
                    ? IncidentOrders[incident.type_value.toLowerCase()]
                    : Object.keys(captureData || {})
                  )
                    .filter(key => captureData[key] !== 'Null')
                    .map((key, ind, arr) => {
                      const value = utils.getFieldValue(
                        formFieldValues,
                        captureData[key],
                      )
                      if (typeof value === 'string') {
                        return (
                          <span key={key}>
                            <b>{utils.makeReadable(key)}:</b> {value}{' '}
                            {arr.length - 1 > ind ? ', ' : ''}
                          </span>
                        )
                      }
                      return null
                    })}
                </td>
              </tr>
              <tr className="incident__messages">
                <th>Messages</th>
                <td colSpan="2">
                  <table className="messages">
                    <tbody>
                      {allIncidentMessages[incident.id].map(message => (
                        <tr
                          key={message.object_id}
                          className={
                            message.user.object_id === currentUser.object_id
                              ? 'left'
                              : 'right'
                          }
                        >
                          <td>
                            <p>{message.message}</p>
                            {message.attachment && (
                              <Image src={message.attachment} alt="" />
                            )}
                            <br />
                            <b>
                              {message.user.name} -{' '}
                              {new Date(message.created_at).toLocaleString(
                                'en-GB',
                              )}
                            </b>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
              {incident.resolved && (
                <tr className="incident__resolution">
                  <th>Resolved</th>
                  <td colSpan="2">
                    {incident.resolved_text} <br />
                    {incident.resolved_image && (
                      <Image src={incident.resolved_image} alt="" />
                    )}
                    <br />
                    {incident.resolved_by && incident.resolved_by.name} -{' '}
                    {moment(incident.resolved_date)
                      .format('DD/MM/YYYY HH:mm')
                      .toLocaleString('en-GB')}
                  </td>
                </tr>
              )}
              {incident.archived && (
                <tr>
                  <th>Closed</th>
                  <td colSpan="2">
                    {incident.archived_text} <br />
                    {incident.archived_by && incident.archived_by.name} -{' '}
                    {moment(incident.archived_date)
                      .format('DD/MM/YYYY HH:mm')
                      .toLocaleString('en-GB')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )
      })}
    </div>
  )
}

ReportIncidents.propTypes = propTypes

ReportIncidents.defaultProps = {}

export default compose(
  withUserContext,
  connect(state => {
    const allDataSource = state.incidentForm.dataSources
      .filter(({ type }) => type === 'data')
      .map(({ values }) => values)

    return {
      allIncidentMessages: getAllIncidentMessages(state),
      incidentMessageLoading: state.incidentMessages.status === 'loading',
      formFieldValues: utils.flattenArray(allDataSource),
    }
  }),
)(ReportIncidents)
