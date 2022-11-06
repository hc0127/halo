import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Parse from 'parse'

import utils from '../../utils/helpers'
import Image from '../common/Image/Image'
import MapContainer from '../MapContainer'
import TagInput from './../TagInput/TagInput'
import { MAP_TYPES } from '../../utils/constants'
import { updateIncidentTagsAction } from '../../stores/ReduxStores/dashboard/incidents'
import { Loading } from '../common'
import moment from 'moment'

const propTypes = {
  incident: PropTypes.instanceOf(Parse.Object).isRequired,
  formFieldValues: PropTypes.arrayOf(PropTypes.object).isRequired,
  incidentDescription: PropTypes.arrayOf(PropTypes.object).isRequired,
  suggestedTags: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
}

const IncidentViewReport = ({
  incident,
  incidentDescription,
  formFieldValues,
  suggestedTags,
  dispatch,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const { capture_data, location } = incident

  let locationData = null

  if (capture_data.location) {
    locationData = capture_data.location
  } else if (location) {
    locationData = location
  }

  if (!locationData) {
    locationData = {}
  }
  const showPhoto = incident.type_value !== 'medical'

  const showMap = !['ejection', 'venueCheck'].includes(incident.type_value)

  const reportedBy = incident.reported_by

  const incidentTagCallback = () => {
    setSubmitting(false)
  }

  if (!reportedBy) {
    return <Loading />
  }

  return (
    <div className="incident-view-reports">
      <table>
        <tbody>
          <tr>
            <th>Who</th>
            <td>
              {reportedBy.name || 'N/A'} {reportedBy.role || ''}
            </td>
          </tr>
          <tr>
            <th>Tags</th>
            <td>
              <TagInput
                key={incident.object_id}
                tags={incident?.tags || []}
                onChange={newTags =>
                  dispatch(
                    updateIncidentTagsAction(incident, newTags, () =>
                      incidentTagCallback(),
                    ),
                  )
                }
                suggestedTags={suggestedTags}
                submitting={submitting}
              />
            </td>
          </tr>

          <>
            {incident.type_value !== 'customerService' && (
              <tr>
                <th>What</th>
                <td>{utils.getIncidentWhatText(incident)}</td>
              </tr>
            )}
            {showMap && (
              <tr>
                <th>Where</th>
                <td>
                  <>
                    {incident.type_value !== 'customerService' && (
                      <>
                        {(incident.capture_data.eventArea !== null &&
                          incident.capture_data.eventArea) ||
                          'N/A'}
                      </>
                    )}
                  </>
                  <div className="incident-view-reports__content-map">
                    <MapContainer
                      key={incident.id}
                      type={MAP_TYPES.Incident}
                      incidentId={incident.id}
                      headless
                    />
                  </div>
                </td>
              </tr>
            )}
          </>
          <>
            <>
              {showPhoto && (
                <tr>
                  <th>
                    {incident.img_file &&
                    !utils.isFileImageByExtensionType(incident.img_file)
                      ? 'Document'
                      : 'Photo'}
                  </th>
                  <td>
                    {incident.img_file ? (
                      <>
                        {utils.isFileImageByExtensionType(incident.img_file) ? (
                          <Image
                            src={window.getFileDefaultUrl() + incident.img_file}
                            alt=""
                            style={{ width: 200 }}
                          />
                        ) : (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={
                              window.getFileDefaultUrl() + incident.img_file
                            }
                          >
                            {incident.img_file}
                          </a>
                        )}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              )}
            </>
          </>

          {incident.type_value === 'violence' && (
            <React.Fragment>
              <tr>
                <th>People involved</th>
                <td>{incident.capture_data.number_of_people}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>
                  {incident.capture_data.assaulted
                    ? 'Someone has been assaulted'
                    : 'No one has been assaulted'}
                </td>
              </tr>
            </React.Fragment>
          )}
          {incident.type_value === 'customerService' ? (
            <>
              <tr>
                <th>Name</th>
                <td>{capture_data.edgName}</td>
              </tr>
              {capture_data.edgStand && (
                <tr>
                  <th>Stand</th>
                  <td>{capture_data.edgStand}</td>
                </tr>
              )}
              {capture_data.edgBlock && (
                <tr>
                  <th>Block</th>
                  <td>{capture_data.edgBlock}</td>
                </tr>
              )}
              {capture_data.edgSeat && (
                <tr>
                  <th>Seat</th>
                  <td>{capture_data.edgSeat}</td>
                </tr>
              )}
              <tr>
                <th>Phone Number</th>
                <td>{capture_data.edgPhoneNumber}</td>
              </tr>
              <tr>
                <th>Message</th>
                <td>{capture_data.edgMessage}</td>
              </tr>
              {capture_data.canContact && (
                <tr>
                  <th>Can contact</th>
                  <td>{capture_data.canContact ? 'Yes' : 'No'}</td>
                </tr>
              )}
            </>
          ) : (
            incidentDescription.map(description => (
              <tr key={description.label}>
                <th>{utils.makeReadable(description.label)}</th>
                <td>
                  {utils.formatString(
                    description.text,
                    description.formatFields.map(
                      field =>
                        utils.getFieldValue(
                          formFieldValues,
                          incident.capture_data[field],
                        ) || '',
                    ),
                  )}
                </td>
              </tr>
            ))
          )}
          {incident.resolved && (
            <React.Fragment>
              {incident.resolved_text && (
                <tr>
                  <th>Resolved Note</th>
                  <td>{incident.resolved_text || '-'}</td>
                </tr>
              )}
              <tr>
                <th>Resolved By</th>
                <td>
                  {(incident.resolved_by && incident.resolved_by.name) || '-'}
                </td>
              </tr>
              <tr>
                <th>Resolved At</th>
                <td>
                  {(incident.resolved_date &&
                    moment(incident.resolved_date).format(
                      'DD/MM/YYYY HH:mm',
                    )) ||
                    '-'}
                </td>
              </tr>
              {incident.resolved_image && (
                <tr>
                  <th>Resolved Image</th>
                  <td>
                    <Image
                      className="incident-view-reports__resolved-image"
                      src={incident.resolved_image}
                      alt=""
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          )}
          {incident.archived && (
            <React.Fragment>
              {incident.archived_text && (
                <tr>
                  <th>Closed Note</th>
                  <td>{incident.archived_text || '-'}</td>
                </tr>
              )}
              <tr>
                <th>Closed By</th>
                <td>
                  {(incident.archived_by && incident.archived_by.name) || '-'}
                </td>
              </tr>
              <tr>
                <th>Closed At</th>
                <td>
                  {(incident.archived_date &&
                    moment(incident.archived_date).format(
                      'DD/MM/YYYY HH:mm',
                    )) ||
                    '-'}
                </td>
              </tr>
              {incident.archived_image && (
                <tr>
                  <th>Closed Image</th>
                  <td>
                    <Image
                      className="incident-view-reports__archived-image"
                      src={incident.archived_image}
                      alt=""
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          )}
        </tbody>
      </table>
    </div>
  )
}

IncidentViewReport.propTypes = propTypes

IncidentViewReport.defaultProps = {}

export default compose(
  connect((state, props) => {
    const { incident } = props

    let incidentDescription = []

    const selectedDescription = state.incidentForm.descriptions.find(
      desc =>
        desc.incident_type === incident.type_value ||
        (incident.type_value.startsWith('custom') &&
          desc.incidentType === 'other'),
    )

    if (selectedDescription) {
      incidentDescription = selectedDescription.data
    }

    const allDataSource = state.incidentForm.dataSources
      .filter(({ type }) => type === 'data')
      .map(({ values }) => values)

    return {
      formFieldValues: [].concat(...allDataSource),
      incidentDescription,
      suggestedTags: [
        ...new Set(
          utils
            .flattenArray(
              Object.values(state.incidents.data).map(
                incident => incident.tags,
              ),
            )
            .filter(tag => tag !== undefined)
            .filter(tag => tag !== null),
        ),
      ],
    }
  }),
)(IncidentViewReport)
