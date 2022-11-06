import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  AdminCard,
  AdminCardBody,
  AdminField,
  AdminButton,
  AdminTitle,
  AdminPage,
  AdminClientSelector,
} from '../../components/common/Admin'
import { withUserContext } from '../../Contexts'
import {
  AdminForm,
  AdminFormRow,
  AdminFormColumn,
} from '../../components/AdminForm'

import {
  saveTicketScanningSettings,
  loadTicketScanningSettings,
} from '../../stores/ReduxStores/admin/ticketScanning'

import {
  IMPORT_TYPE_OPTIONS,
  IMPORT_TYPE_FIELDS,
  USER_PERMISSIONS,
} from '../../utils/constants'
import AdminSavePanel from '../../components/common/Admin/AdminSavePanel'
import { compose } from 'redux'
import { loadClientsAction } from '../../stores/ReduxStores/admin/clients'
import utils from '../../utils/helpers'

class AdminTicketScanningPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loaded: false,
      clientId: '',
      clientSettings: {},
      importType: '',
      importCredentials: '{}',
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.ticketScanningSettings && !state.loaded) {
      return {
        clientSettings: props.ticketScanningSettings,
        importType: props.ticketScanningSettings?.import_type || '',
        importCredentials: props.ticketScanningSettings.encrypted_credentials
          ? JSON.parse(
              props.ticketScanningSettings.encrypted_credentials.replace(
                /\'/g, // eslint-disable-line
                '"',
              ),
            )
          : '',
        loaded: true,
      }
    }

    if (state.loaded && props.status === 'saved') {
      props.dispatch(loadTicketScanningSettings())
      return { loaded: false }
    }

    return null
  }

  componentDidMount() {
    if (
      utils.hasPermission(this.props.currentUser, [
        USER_PERMISSIONS.ClientManager,
      ])
    ) {
      const clientId = this.props.currentUser.client.object_id
      this.setState({ clientId })
    }

    if (
      this.props.currentUser.permission_role === USER_PERMISSIONS.ClientManager
    ) {
      this.props.dispatch(
        loadTicketScanningSettings(this.props.currentUser.client.object_id),
      )
    } else {
      this.props.dispatch(loadTicketScanningSettings())
    }
    this.props.dispatch(loadClientsAction())
  }

  updateClientId() {
    return value => {
      this.setState(state => {
        return {
          clientId: value,
          importType: state.clientSettings[value]
            ? state.clientSettings[value].type
            : '',
          importCredentials: state.clientSettings[value]
            ? state.clientSettings[value].credentials
            : {},
          loaded: false,
          stateChanged: true,
        }
      })
      this.props.dispatch(loadTicketScanningSettings(value))
    }
  }

  updateField(fieldName) {
    return value => {
      this.setState({ [fieldName]: value, stateChanged: true })
    }
  }

  updateCredentialsField(fieldName) {
    return value => {
      let { importCredentials } = this.state

      let newCredentials = { ...importCredentials, [fieldName]: value }

      this.setState({ importCredentials: newCredentials, stateChanged: true })
    }
  }

  saveTicketScanning() {
    this.props.dispatch(
      saveTicketScanningSettings({
        ...this.state,
      }),
    )
    this.setState({ stateChanged: false })
  }

  dynamicRequiredFields() {
    const fields = IMPORT_TYPE_FIELDS[this.state.importType]
    const credentials = this.state.importCredentials

    let isValid = true

    if (!fields) {
      return false
    }

    Object.keys(fields).forEach(field => {
      if (!fields[field].required) {
        return false
      }

      if (isValid) {
        isValid = credentials[field] && credentials[field] !== ''
      }
    })

    return isValid
  }

  render() {
    const { clients } = this.props
    const { importType, importCredentials, clientId, stateChanged } = this.state

    const selectedImportTypeFields = IMPORT_TYPE_FIELDS[importType]

    return (
      <AdminPage>
        <AdminTitle>Ticket Scanning</AdminTitle>
        {utils.hasPermission(this.props.currentUser, [
          USER_PERMISSIONS.CrestAdmin,
        ]) && (
          <AdminClientSelector
            value={clientId}
            clients={clients}
            onChange={this.updateClientId()}
            editing={false}
            required="Please select a client."
          />
        )}
        <AdminCard
          className="admin-ticket-scanning-page__details"
          title="Details"
        >
          <AdminCardBody>
            <AdminForm>
              <AdminFormColumn size={3}>
                <AdminFormRow>
                  <AdminField
                    label="Import"
                    type="dropdown"
                    placeholder={
                      IMPORT_TYPE_OPTIONS.length > 0
                        ? 'Select import type'
                        : 'No import types available'
                    }
                    options={IMPORT_TYPE_OPTIONS}
                    value={importType || ''}
                    onChange={this.updateField('importType')}
                    disabled={
                      utils.hasPermission(this.props.currentUser, [
                        USER_PERMISSIONS.CrestAdmin,
                      ]) && clientId === ''
                    }
                  />
                </AdminFormRow>
                {importType !== '' &&
                  Object.keys(selectedImportTypeFields).map(field => {
                    return (
                      <AdminFormRow key={field}>
                        <AdminField
                          label={selectedImportTypeFields[field].label}
                          type={selectedImportTypeFields[field].type}
                          value={importCredentials[field] || ''}
                          placeholder={
                            selectedImportTypeFields[field].placeholder
                          }
                          onChange={this.updateCredentialsField(field)}
                          required={selectedImportTypeFields[field].required}
                          tooltip={selectedImportTypeFields[field].warning}
                        />
                      </AdminFormRow>
                    )
                  })}
              </AdminFormColumn>
            </AdminForm>
          </AdminCardBody>
        </AdminCard>
        <AdminSavePanel inDialog={false}>
          <AdminButton
            onClick={() => this.saveTicketScanning()}
            disabled={!stateChanged || !this.dynamicRequiredFields()}
          >
            Save
          </AdminButton>
        </AdminSavePanel>
      </AdminPage>
    )
  }
}

AdminTicketScanningPage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  ticketScanningSettings: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  clients: PropTypes.array.isRequired,
}

export default compose(
  withUserContext,
  connect(state => {
    return {
      status: state.ticketScanning.status,
      ticketScanningSettings: state.ticketScanning.data,
      clients: Object.values(state.clients.data),
    }
  }),
)(AdminTicketScanningPage)
