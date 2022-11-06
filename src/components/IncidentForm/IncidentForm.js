import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Parse from 'parse'

import utils from '../../utils/helpers'
import { Button } from '../common'
import { IncidentFormField } from '..'
import { closeSlidingView } from '../../stores/ReduxStores/dashboard/dashboard'
import {
  saveIncident,
  updateIncidentDetails,
  addMessageToIncident,
} from '../../stores/ReduxStores/dashboard/incidents'
import { withUserContext } from '../../Contexts'
import DashboardButton from '../DashboardButton'
import { notify } from '../../stores/ReduxStores/admin/admin'
import GDPRPopup from '../common/GDPRPopup/GDPRPopup'

const propTypes = {
  forms: PropTypes.arrayOf(PropTypes.object).isRequired,
  incidents: PropTypes.arrayOf(PropTypes.object).isRequired,
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataSources: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatch: PropTypes.func.isRequired,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
  incidentById: PropTypes.instanceOf(Parse.Object),
}

class IncidentForm extends Component {
  constructor() {
    super()
    this.state = {
      selectedForm: '',
      formValues: {},
      saving: false,
      openGDPR: false,
      selectLabel: '',
      updating: false,
    }
  }

  componentDidMount() {
    const { incidentById } = this.props
    if (incidentById) {
      const label = this.getCustomIncidentLabel(incidentById.type_value)
      this.setState({
        selectedForm: incidentById?.type_value,
        selectLabel: label,
        formValues: { ...incidentById.capture_data },
      })
    }
  }

  getDataSource(fieldId) {
    const { dataSources } = this.props
    const formField = this.getFormField(fieldId)

    if (!formField.dataSourceType) {
      return []
    }

    const selectedDataSource = dataSources.filter(
      source => source.name === formField.dataSourceType,
    )[0]

    if (!selectedDataSource) {
      return []
    }

    return selectedDataSource.values
  }

  getFormData() {
    const { forms } = this.props
    const { selectedForm } = this.state

    const formData = forms.find(
      form =>
        form.incident_type === selectedForm ||
        (selectedForm.startsWith('custom:') && form.incident_type === 'other'),
    )

    if (!selectedForm) {
      return []
    }

    const { incident_data } = formData

    if (!incident_data) {
      return []
    }

    return incident_data.filter(page => page.title.toLowerCase() !== 'review')
  }

  getIncidentTypes() {
    const { incidents } = this.props
    return utils.sort(incidents, incidentType => incidentType.label, 'asc')
  }

  getCustomIncidentLabel(customType) {
    return this.getIncidentTypes().filter(type => type.type === customType)[0]
      .label
  }

  getFormField(fieldId) {
    const { fields } = this.props

    const selectedField = fields.filter(field => field.id === fieldId)[0]

    if (!selectedField) {
      return {}
    }

    return selectedField
  }

  handleChange = (id, value) => {
    const { formValues } = this.state

    if (id === 'location') {
      const location = {
        longitude: value.lng,
        latitude: value.lat,
      }
      this.setState({
        formValues: { ...formValues, location },
      })
      return
    }
    this.setState({
      formValues: { ...formValues, [id]: value },
    })
  }

  submitForm() {
    const { dispatch, currentUser } = this.props
    const { formValues, selectedForm } = this.state
    const values = { ...formValues }

    const formIds = Object.keys(values)

    let fileUpload = null
    this.setState({ openGDPR: false })
    for (let i = 0; i < formIds.length; i++) {
      const formId = formIds[i]
      const value = values[formId]
      if (value instanceof Blob) {
        fileUpload = value
        delete values[formId]
      }
    }

    this.setState({ saving: true })
    dispatch(saveIncident(selectedForm, formValues, fileUpload, currentUser))
  }

  updateForm() {
    const { dispatch, currentUser, incidentById } = this.props
    const { formValues, selectedForm } = this.state
    const values = { ...formValues }

    const formIds = Object.keys(values)

    let fileUpload = null
    this.setState({ openGDPR: false })
    for (let i = 0; i < formIds.length; i++) {
      const formId = formIds[i]
      const value = values[formId]
      if (value instanceof Blob) {
        fileUpload = value
        delete values[formId]
      }
    }

    this.setState({ updating: true })
    let messageText = `${currentUser.username} has changed the contents of this incident`
    dispatch(addMessageToIncident(incidentById, messageText, null, () => {}))
    dispatch(
      updateIncidentDetails(
        incidentById.id,
        selectedForm,
        formValues,
        fileUpload,
        currentUser,
      ),
    )
  }

  rejectForm() {
    const { dispatch } = this.props
    this.setState({ openGDPR: false })
    dispatch(notify('Incident not submitted!'))
    dispatch(closeSlidingView())
  }

  openGDPR() {
    this.setState({ openGDPR: true })
  }

  render() {
    const { dispatch, incidentById } = this.props
    const { selectedForm, formValues, saving, updating } = this.state
    const formData = this.getFormData()

    return (
      <div className="IncidentForm">
        <div className="IncidentForm__controls">
          <Button onClick={() => dispatch(closeSlidingView())} type="close">
            <span>&times;</span>
          </Button>
        </div>

        <div className="IncidentForm__header">
          <h1>
            {incidentById && selectedForm
              ? 'Update Incident'
              : 'Create new incident'}
          </h1>
          Incident Type:
          {incidentById && selectedForm ? (
            this.state.selectLabel
          ) : (
            <select /* eslint-disable-line */
              value={selectedForm}
              onChange={e =>
                this.setState({ selectedForm: e.target.value, formValues: {} })
              }
            >
              <option value="">Select an incident type</option>
              {this.getIncidentTypes().map(incidentType => (
                <option key={incidentType.type} value={incidentType.type}>
                  {incidentType.label}
                </option>
              ))}
            </select>
          )}
        </div>
        {selectedForm ? (
          <div className="IncidentForm__content">
            {formData.map((page, pageIndex) =>
              page.title === 'review' ? null : (
                <div key={page.title}>
                  <h3>
                    {pageIndex === 0 && selectedForm.startsWith('custom')
                      ? this.getCustomIncidentLabel(selectedForm)
                      : utils.makeReadable(page.title)}
                  </h3>
                  <div>
                    {page.pageData.map(field => (
                      <div key={JSON.stringify(field)}>
                        <div className="IncidentForm__content__title">
                          <p>{field.subtitle}</p>
                        </div>
                        {field.sectionData.map(fieldId => {
                          return (
                            <IncidentFormField
                              key={selectedForm + JSON.stringify(fieldId)}
                              {...this.getFormField(fieldId)}
                              dataSource={this.getDataSource(fieldId)}
                              value={formValues[fieldId]}
                              event={null}
                              handleChange={(id, value) =>
                                this.handleChange(id, value)
                              }
                              numberOnly={[
                                'numberOfPeople',
                                'numberOfVehicles',
                                'banDuration',
                                'age',
                                'mobile',
                                'informantMobile',
                              ].some(el => fieldId.includes(el))}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
            <div>
              {/* {!formValues.location && selectedForm !== 'ejection' && (
                <>
                  Please add a pin on the map before submitting an incident
                  <br />
                  <br />
                </>
              )} */}
              <DashboardButton
                onClick={() => {
                  this.props.currentUser.client.enabled_features.includes(
                    'GDPRChecks',
                  )
                    ? this.openGDPR()
                    : incidentById && selectedForm
                    ? this.updateForm()
                    : this.submitForm()
                }}
                loading={saving || updating}
              >
                {incidentById && selectedForm ? 'Save' : 'Submit'}
              </DashboardButton>
            </div>
          </div>
        ) : (
          <div className="IncidentForm__empty">
            <div>Select an Incident Type, to load the appropriate form</div>
          </div>
        )}
        <GDPRPopup
          openGDPR={this.state.openGDPR}
          submitForm={() =>
            incidentById && selectedForm ? this.updateForm() : this.submitForm()
          }
          rejectForm={() => this.rejectForm()}
        />
      </div>
    )
  }
}
IncidentForm.propTypes = propTypes

IncidentForm.defaultProps = {
  incidentById: null,
}

export default withUserContext(
  connect(state => {
    const incidentId = state.dashboard.openedIncidentId

    let incidentById = incidentId ? state.incidents.data[incidentId] : null

    return {
      forms: state.incidentForm.forms,
      incidents: state.incidentForm.incidents,
      fields: state.incidentForm.fields,
      dataSources: state.incidentForm.dataSources,
      incidentById: incidentById,
    }
  })(IncidentForm),
)
