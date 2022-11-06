import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Prompt } from 'react-router'
import Parse from 'parse'
import moment from 'moment'

import Loading from '../../components/common/Loading/Loading'
import {
  AdminCard,
  AdminCardBody,
  AdminField,
  AdminButton,
  AdminTitle,
  AdminPage,
  AdminLimitCard,
  AdminTabCard,
  AdminTabTitle,
  AdminTabContent,
} from '../../components/common/Admin'

import {
  AdminForm,
  AdminFormRow,
  AdminFormColumn,
} from '../../components/AdminForm'

import ButtonWithIcon from '../../components/common/ButtonWithIcon'
import { AdminTable } from '../../components/AdminTable'

import {
  saveClientsAction,
  refreshClientsAction,
  loadClientsAction,
  SaveStatus,
  reloadClientsAction,
} from '../../stores/ReduxStores/admin/clients'
import utils from '../../utils/helpers'
import {
  BUTTON_ICONS,
  VARIANT,
  INCIDENT_TYPES,
  ROUTES,
  CLIENT_FEATURES,
  DIALOG_TYPE,
  CLIENT_FEATURES_LABEL,
  ADMIN_TABLE_VARIANTS,
} from '../../utils/constants'
import { loadGeoFencesAction } from '../../stores/ReduxStores/admin/geofences'
import { loadGroupsAction } from '../../stores/ReduxStores/admin/groups'
import {
  loadBeaconsAction,
  deleteBeaconsAction,
  saveBeaconsAction,
} from '../../stores/ReduxStores/admin/beacondetails'
import AdminSavePanel from '../../components/common/Admin/AdminSavePanel'
import AdminSaveConflictHandler from '../../components/common/Admin/AdminSaveConflictHandler'
import WarnBeforeLeave from '../../components/WarnBeforeLeave'
import { openDialog } from '../../stores/ReduxStores/dialog'

class AdminClientDetailsPage extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({ id: PropTypes.string }).isRequired,
    }).isRequired,
    client: PropTypes.instanceOf(Parse.Object),
    status: PropTypes.string.isRequired,
    beacondetails: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
    usedIncidentTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
    newClient: PropTypes.bool,
    staffCount: PropTypes.number,
    eventCount: PropTypes.number,
    usedFeatures: PropTypes.arrayOf(
      PropTypes.oneOf(Object.values(CLIENT_FEATURES)),
    ).isRequired,
    loading: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    customIncidentTypes: PropTypes.array.isRequired,
  }

  static defaultProps = {
    newClient: false,
    staffCount: 0,
    eventCount: 0,
    client: null,
  }

  constructor(props) {
    super(props)

    this.state = {
      name: '',
      address: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      enabledIncidentTypes: INCIDENT_TYPES,
      loaded: false,
      stateChanged: false,
      customIncidentTypes: [],
      beacondetails: [],
      newCustomIncident: '',
      licenceExpiry: undefined,
      eventLimit: '',
      staffLimit: '',
      enabledFeatures: [],
      suspended: false,
      updatedAt: null,
    }

    this.addCustomIncident = this.addCustomIncident.bind(this)
    this.selectedTabIdx = new React.createRef()
  }

  static getDerivedStateFromProps(props, state) {
    if (props.newClient && !state.loaded) {
      return { loaded: true }
    }
    if (props.client && !state.loaded) {
      return {
        name: props.client.name,
        address: props.client.address,
        contactName: props.client.contact_name,
        contactEmail: props.client.contact_email,
        contactPhone: props.client.contact_phone,
        licenceExpiry:
          props.client.licence_expiry && moment(props.client.licence_expiry),
        eventLimit: props.client.event_limit || '',
        staffLimit: props.client.staff_limit || '',
        enabledIncidentTypes:
          props.client.enabled_incident_types || INCIDENT_TYPES,
        customIncidentTypes: props.customIncidentTypes.map(type => ({
          id: type.object_id,
          name: type.name,
        })),
        newCustomIncident: '',
        suspended: props.client.suspended || false,
        enabledFeatures: props.client.enabled_features || [],
        loaded: true,
        stateChanged: false,
        updatedAt: props.client.updated_at,
      }
    }

    if (state.loaded && props.status === SaveStatus.Saved) {
      props.dispatch(refreshClientsAction())
      if (props.newClient) {
        props.history.push(ROUTES.Private.AdminClients)
        return null
      }
      return { loaded: false }
    }
    return null
  }

  componentDidMount() {
    this.props.dispatch(loadClientsAction())
    this.props.dispatch(loadGeoFencesAction())
    this.props.dispatch(loadGroupsAction())
    this.props.dispatch(loadBeaconsAction())
  }

  get tableData() {
    const { beacondetails } = this.props
    return beacondetails.map(data => {
      return {
        id: data.beacon_id,
        title: data.beacon_name,
        location: data.location,
      }
    })
  }

  deleteBeacons(beacondetails) {
    this.props.dispatch(
      deleteBeaconsAction(beacondetails.map(beacondetails => beacondetails.id)),
    )
  }

  duplicateBeacons(data) {
    const duplicateData = {
      beacon_name: data.title,
      beacon_location: data.location,
    }
    this.props.dispatch(saveBeaconsAction(duplicateData))
  }

  updateField(fieldName) {
    return value => {
      this.setState({ [fieldName]: value, stateChanged: true })
    }
  }

  updateSwitchField(stateArrayName, fieldName) {
    return value => {
      const existingFields = [...this.state[stateArrayName]]

      if (value) {
        existingFields.push(fieldName)
      } else {
        existingFields.splice(existingFields.indexOf(fieldName), 1)
      }

      this.setState({ [stateArrayName]: existingFields, stateChanged: true })
    }
  }

  updateEnabledFeatures(fieldName) {
    return value => {
      let existingFields = [...this.state.enabledFeatures]

      if (value) {
        if (fieldName === CLIENT_FEATURES.TargetedDashboard) {
          existingFields.push(
            CLIENT_FEATURES.TargetedDashboard,
            CLIENT_FEATURES.UserGroups,
            CLIENT_FEATURES.IncidentTriaging,
          )
          existingFields = utils.removeDuplicate(existingFields)
        } else {
          existingFields.push(fieldName)
        }
      } else {
        existingFields.splice(existingFields.indexOf(fieldName), 1)

        if (
          fieldName === CLIENT_FEATURES.UserGroups ||
          fieldName === CLIENT_FEATURES.IncidentTriaging
        ) {
          const targetedDashboardIndex = existingFields.indexOf(
            CLIENT_FEATURES.TargetedDashboard,
          )

          if (targetedDashboardIndex !== -1) {
            existingFields.splice(targetedDashboardIndex, 1)
          }
        }
      }

      this.setState({ enabledFeatures: existingFields, stateChanged: true })
    }
  }

  saveClient() {
    this.props.dispatch(
      saveClientsAction({
        id: this.props.match.params.id,
        ...this.state,
        initialIncidents: this.props.customIncidentTypes,
        mutatedIncidents: this.state.customIncidentTypes,
        licenceExpiry:
          this.state.licenceExpiry && this.state.licenceExpiry.toDate(),
      }),
    )
    this.setState({ stateChanged: false })
  }

  reloadClient() {
    this.props.dispatch(reloadClientsAction())

    this.setState({ loaded: false })
  }

  addCustomIncident() {
    const { customIncidentTypes, newCustomIncident } = this.state
    this.setState({
      customIncidentTypes: customIncidentTypes.concat([
        { name: newCustomIncident },
      ]),
      newCustomIncident: '',
      stateChanged: true,
    })
  }

  render() {
    const {
      history,
      dispatch,
      client,
      status,
      usedIncidentTypes,
      newClient,
      staffCount,
      eventCount,
      usedFeatures,
      loading,
    } = this.props

    if (!(client || newClient) || loading) {
      return <Loading centered />
    }

    const {
      name,
      address,
      contactName,
      contactEmail,
      contactPhone,
      enabledIncidentTypes,
      customIncidentTypes,
      newCustomIncident,
      licenceExpiry,
      eventLimit,
      staffLimit,
      enabledFeatures,
      suspended,
      stateChanged,
    } = this.state

    const requiredFields =
      name && address && contactName && contactPhone && contactEmail

    return (
      <AdminPage>
        {stateChanged && (
          <Prompt message="You have unsaved changes, are you sure you want to leave?" />
        )}
        <WarnBeforeLeave enabled={stateChanged} />
        <AdminTitle>{name || 'Halo Client'}</AdminTitle>
        <AdminTabCard ref={this.selectedTabIdx}>
          <AdminTabTitle>Client Details</AdminTabTitle>
          <AdminTabContent>
            <AdminForm>
              <AdminFormColumn size={3}>
                <AdminFormRow>
                  <AdminField
                    label="Company Name"
                    type="text"
                    value={name}
                    onChange={this.updateField('name')}
                    required="Please enter an company name."
                  />
                </AdminFormRow>
                <AdminFormRow size={2}>
                  <AdminField
                    label="Address"
                    type="textarea"
                    value={address}
                    onChange={this.updateField('address')}
                    required="Please enter an address."
                  />
                </AdminFormRow>
              </AdminFormColumn>
              <AdminFormColumn size={2}>
                <AdminFormRow>
                  <AdminField
                    label="Contact Name"
                    type="text"
                    value={contactName}
                    onChange={this.updateField('contactName')}
                    required="Please enter a contact name."
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Email"
                    type="text"
                    value={contactEmail}
                    onChange={this.updateField('contactEmail')}
                    required="Please enter a contact email."
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Phone"
                    type="text"
                    value={contactPhone}
                    onChange={this.updateField('contactPhone')}
                    required="Please enter a contact phone."
                  />
                </AdminFormRow>
              </AdminFormColumn>
              <AdminFormColumn size={1}>
                <AdminFormRow>
                  <AdminField
                    label="Licence Expiry"
                    type="date"
                    value={licenceExpiry}
                    onChange={this.updateField('licenceExpiry')}
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Event Limit"
                    type="number"
                    value={eventLimit}
                    onChange={this.updateField('eventLimit')}
                    maxLength={6}
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Person Limit"
                    type="number"
                    value={staffLimit}
                    onChange={this.updateField('staffLimit')}
                    maxLength={6}
                  />
                </AdminFormRow>
              </AdminFormColumn>
              <AdminFormColumn size={0.5}>
                <div className="admin-centered-container">
                  <AdminFormRow>
                    <AdminLimitCard title="Events" isBordered={true}>
                      {eventCount}/{eventLimit || '-'}
                    </AdminLimitCard>
                  </AdminFormRow>
                  <AdminFormRow>
                    <AdminLimitCard title="People" isBordered={true}>
                      {staffCount}/{staffLimit || '-'}
                    </AdminLimitCard>
                  </AdminFormRow>
                  <AdminFormRow>
                    <AdminCardBody thin>
                      <AdminField
                        type="switch"
                        label="Suspend"
                        value={suspended}
                        onChange={this.updateField('suspended')}
                        variant={VARIANT.Secondary}
                      />
                    </AdminCardBody>
                  </AdminFormRow>
                </div>
              </AdminFormColumn>
            </AdminForm>
          </AdminTabContent>
          <AdminTabTitle>Features</AdminTabTitle>
          <AdminTabContent>
            <div className="admin-feature-container">
              {Object.values(CLIENT_FEATURES).map(feature => (
                <div className="admin-switch-container" key={feature}>
                  <AdminField
                    label={CLIENT_FEATURES_LABEL[feature]}
                    type="switch"
                    value={enabledFeatures.includes(feature)}
                    onChange={this.updateEnabledFeatures(feature)}
                    disabled={usedFeatures.includes(feature)}
                  />
                </div>
              ))}
            </div>
          </AdminTabContent>
          <AdminTabTitle>Incidents</AdminTabTitle>
          <AdminTabContent>
            <div className="admin-incident-types-container">
              {INCIDENT_TYPES.map(type => (
                <div className="admin-switch-container" key={type}>
                  <AdminField
                    label={utils.makeReadable(type)}
                    type="switch"
                    value={enabledIncidentTypes.includes(type)}
                    onChange={this.updateSwitchField(
                      'enabledIncidentTypes',
                      type,
                    )}
                    disabled={usedIncidentTypes.includes(type)}
                  />
                </div>
              ))}
            </div>
            <div>
              <AdminCard title="Custom Other Incidents">
                <AdminCardBody nopadding>
                  <table className="custom-incident">
                    <tbody>
                      {customIncidentTypes.map((customType, index) => (
                        <tr key={customType.id || index}>
                          <td>
                            <AdminField
                              type="text"
                              placeholder="Click on the bin to delete"
                              value={customType.name}
                              onChange={value =>
                                this.setState({
                                  customIncidentTypes: customIncidentTypes.map(
                                    type =>
                                      type === customType
                                        ? { ...customType, name: value }
                                        : type,
                                  ),
                                  stateChanged: true,
                                })
                              }
                            />
                          </td>
                          <td>
                            <ButtonWithIcon
                              onClick={() =>
                                this.setState({
                                  customIncidentTypes: customIncidentTypes.filter(
                                    type => type !== customType,
                                  ),
                                  stateChanged: true,
                                })
                              }
                              hollow
                              title="Delete"
                              icon={BUTTON_ICONS.Delete}
                              variant={VARIANT.Secondary}
                              disabled={usedIncidentTypes.includes(
                                `custom:${customType.id}`,
                              )}
                            />
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td>
                          <AdminField
                            type="text"
                            placeholder="Create custom Incident"
                            value={newCustomIncident}
                            onChange={this.updateField('newCustomIncident')}
                            onEnter={this.addCustomIncident}
                          />
                        </td>
                        <td>
                          <ButtonWithIcon
                            onClick={this.addCustomIncident}
                            hollow
                            title="Create"
                            icon={BUTTON_ICONS.CreateHollow}
                            variant={VARIANT.Primary}
                            disabled={newCustomIncident.trim() === ''}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </AdminCardBody>
              </AdminCard>
            </div>
          </AdminTabContent>
          <AdminTabTitle>Hardware</AdminTabTitle>
          <AdminTabContent>
            <AdminTable
              onCreateClick={onHardawareCreate =>
                dispatch(
                  openDialog({
                    type: DIALOG_TYPE.AddBeacon,
                    onHardawareCreate,
                  }),
                )
              }
              onRowClick={row =>
                dispatch(
                  openDialog({
                    type: DIALOG_TYPE.AddBeacon,
                    beacon_id: row.id,
                  }),
                )
              }
              initialIndex={0}
              rowPerPage={10}
              isPaginated
              isSearchDisplay={false}
              data={this.tableData}
              headers={['Beacon ID', 'Location']}
              columns={['title', 'location']}
              globalActions={[
                {
                  icon: BUTTON_ICONS.Delete,
                  title: 'Delete',
                  onClick: rows => this.deleteBeacons(rows),
                },
              ]}
              rowActions={[
                {
                  icon: BUTTON_ICONS.Edit,
                  onClick: row =>
                    dispatch(
                      openDialog({
                        type: DIALOG_TYPE.AddBeacon,
                        beacon_id: row.id,
                      }),
                    ),
                },
                {
                  icon: BUTTON_ICONS.CopyRed,
                  title: 'Copy',
                  onClick: rows => this.duplicateBeacons(rows),
                },
              ]}
              variant={ADMIN_TABLE_VARIANTS.Contained}
            />
          </AdminTabContent>
        </AdminTabCard>
        <AdminSavePanel inDialog={false}>
          <div className="admin-button-container">
            <ButtonWithIcon
              icon={BUTTON_ICONS.LeftArrow}
              title="Back"
              onClick={() => history.push(`/admin/clients`)}
            />
            {status === SaveStatus.Conflict ? (
              <AdminSaveConflictHandler
                onReload={() => this.reloadClient()}
                message="A client has been updated since you loaded clients. Please reload to try again."
              />
            ) : null}
            <AdminButton
              onClick={() => this.saveClient()}
              loading={status === SaveStatus.Saving}
              disabled={
                !stateChanged ||
                !requiredFields ||
                status === SaveStatus.Conflict
              }
            >
              Save
            </AdminButton>
          </div>
        </AdminSavePanel>
      </AdminPage>
    )
  }
}

export default connect((state, props) => {
  const clientId = props.match.params.id

  let usedIncidentTypes = []

  const client = state.clients.data[clientId]
  const beacondetails = Object.values(state.beacondetails.data)
  if (state.clients.extraData[clientId]) {
    ;({ usedIncidentTypes } = state.clients.extraData[clientId])
  }

  const clientGeofences = state.geofences.list.filter(
    geofence => geofence.event.client.object_id === clientId,
  )

  const hasMultiGeofence = utils.hasDuplicate(
    clientGeofences.map(geofence => geofence.event.object_id),
  )

  const usedFeatures = []
  if (hasMultiGeofence) {
    usedFeatures.push(CLIENT_FEATURES.MultiGeofences)
  }

  const clientGroups = Object.values(state.groups.data).filter(
    group => group.client.object_id === clientId,
  )

  if (clientGroups.length > 0) {
    usedFeatures.push(CLIENT_FEATURES.UserGroups)
  }

  return {
    client,
    beacondetails,
    status: state.clients.saveStatus,
    customIncidentTypes: state.customIncidentTypes.list.filter(
      type => type.client === clientId,
    ),
    usedIncidentTypes,
    staffCount: state.clients.extraData.staffCounts[clientId] || 0,
    eventCount: state.clients.extraData.eventCounts[clientId] || 0,
    usedFeatures,
    loading:
      state.clients.status === 'loading' ||
      state.geofences.status === 'loading' ||
      state.groups.status === 'loading',
  }
})(AdminClientDetailsPage)
