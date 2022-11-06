import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Prompt } from 'react-router'
import moment from 'moment'
import Parse from 'parse'

import Loading from '../../components/common/Loading/Loading'
import {
  AdminCard,
  AdminCardBody,
  AdminField,
  AdminButton,
  AdminTitle,
  AdminPage,
  AdminTabCard,
  AdminTabTitle,
  AdminTabContent,
  AdminGeofence,
  AdminStaffSelector,
  AdminClientSelector,
  AdminDocumentSelector,
} from '../../components/common/Admin'
import AdminNotification from '../../components/common/Admin/AdminNotification'
import {
  AdminForm,
  AdminFormColumn,
  AdminFormRow,
} from '../../components/AdminForm'

import {
  BUTTON_ICONS,
  VARIANT,
  ROUTES,
  DIALOG_TYPE,
  MAX_GEOFENCE_COUNT,
  USER_PERMISSIONS,
  CHECK_TYPE_TEXT,
  RECURRING_PERIOD_TEXT,
  RECURRING_PERIOD,
} from '../../utils/constants'

import utils from '../../utils/helpers'
import { withUserContext } from '../../Contexts'

import ButtonWithIcon from '../../components/common/ButtonWithIcon'
import {
  closeEventAction,
  saveEvent,
  refreshEvent,
} from '../../stores/ReduxStores/admin/events'
import {
  getEventAction,
  getHaloChecks,
  searchHaloChecks,
  createHaloCheck,
  updateHaloCheck,
  loadMoreHaloChecks,
  getClientUsers,
  deleteHaloChecks,
} from '../../stores/ReduxStores/admin/activeEvent'
import { openDialog, closeDialog } from '../../stores/ReduxStores/dialog'
import { loadClientsAction } from '../../stores/ReduxStores/admin/clients'
import AdminSavePanel from '../../components/common/Admin/AdminSavePanel'
import AdminHeaderLogoUploadField from '../../components/common/Admin/AdminHeaderLogoUploadField'
import WarnBeforeLeave from '../../components/WarnBeforeLeave'
import { loadTicketImportLog } from '../../stores/ReduxStores/admin/ticketImportLogs'
import {
  AdminTableBody,
  AdminTableFooter,
  AdminTableHeader,
} from '../../components/AdminTable'
import AdminEmptyPage from '../../components/AdminEmptyPage/AdminEmptyPage'
import AdminInteractiveDialog from '../../components/common/Admin/AdminInteractiveDialog'
import AdminDialogAddOrModifyHaloCheck from '../../components/common/Admin/Dialog/AdminDialogAddOrModifyHaloCheck'
import { loadGroupsAction } from '../../stores/ReduxStores/admin/groups'
import AdminEventDetailsDeleteCheckDialog from './AdminEventDetailsDeleteCheckDialog'
import AdminEventDetailsDeleteDocument from './AdminEventDetailsDeleteDocument'
import AdminDialogCreateDocument from '../../components/common/Admin/Dialog/AdminDialogCreateDocument'
import axios from 'axios'
import { DOCUMENTS_SERVER, DOCUMENT_API_KEY } from '../../settings'

class AdminEventDetailPage extends React.Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({ id: PropTypes.string }).isRequired,
    }).isRequired,
    event: PropTypes.instanceOf(Parse.Object),
    dispatch: PropTypes.func.isRequired,
    newEvent: PropTypes.bool,
    status: PropTypes.string.isRequired,
    users: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    clients: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    duplicateEvent: PropTypes.bool,
    currentUser: PropTypes.instanceOf(Parse.User).isRequired,
    geofences: PropTypes.array,
    groups: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)),
    adminChecks: PropTypes.array,
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
    ticketScanningSettings: PropTypes.object.isRequired,
    ticketImportLogs: PropTypes.array,
    staffCounts: PropTypes.object,
    clientId: PropTypes.string,
    importSettings: PropTypes.object,
    isSaving: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isLoadingMoreData: PropTypes.bool.isRequired,
    isAdminChecksLoading: PropTypes.bool,
    nextPageHaloChecks: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    ticketImportLog: PropTypes.object.isRequired,
    totalChecks: PropTypes.number.isRequired,
  }

  static defaultProps = {
    event: null,
    newEvent: false,
    duplicateEvent: false,
    geofences: [],
    adminChecks: [],
    groups: [],
    ticketImportLogs: [],
    staffCounts: {},
    clientId: '',
    importSettings: {},
    isAdminChecksLoading: false,
  }

  constructor(props) {
    super(props)

    this.haloCheckDialogRef = new React.createRef()
    this.deleteCheckDialogRef = new React.createRef()
    this.selectedTabIdx = new React.createRef()
    this.documentDialogRef = new React.createRef()
    this.documentDeleteCheckDialogRef = new React.createRef()

    this.state = {
      // id: null,
      title: '',
      startDate: undefined,
      overview: '',
      brief: null,
      address: '',
      endDate: undefined,
      geofences: [],
      adminChecks: [],
      zones: [],
      newZone: '',
      eventUserIds: [],
      shiftManagerId: '',
      stateChanged: false,
      capacityTotal: '',
      eventPin: '',
      eventCode: '',
      clientId: props.clientId || '',
      customLogo: null,
      importType: '',
      importPerformanceId: '',
      ticketImportLogs: [],
      adminChecksSearch: '',
      selectedHaloCheckIds: [],
      modifyHaloCheck: null,
      client: null,
      isPublicReportingEnabled: false,
      isChecksUploaded: false,
      duplicatedChecks: [],
      currentPageNo: 0,
      documentLoading: true,
      documentData: null,
      document: null,
      noDocs: false,
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.newEvent && !state.loaded) {
      return { loaded: true }
    }

    if (props.event && !props.isLoading && !state.loaded) {
      return {
        title: props.event.title,
        startDate: props.event.start_date && moment(props.event.start_date),
        overview: props.event.overview,
        brief: props.event.brief_file,
        address: props.event.venue_address,
        endDate: props.event.end_date && moment(props.event.end_date),
        geofences: props.geofences,
        adminChecks: props.event.checks.results,
        zones: props.event.zones || [],
        newZone: '',
        eventUserIds: props.event.users || [],
        shiftManagerId: props.event.controlled_by
          ? props.event.controlled_by.object_id
          : '',
        capacityTotal: props.event.capacity_total,
        eventPin: props.event.event_pin,
        eventCode: props.event.event_code,
        clientId: props.event.client.object_id,
        stateChanged: false,
        isClosed: props.event.closed,
        customLogo: props.event.custom_logo_file,
        importType: props.ticketScanningSettings
          ? props.ticketScanningSettings.import_type
          : '',
        importPerformanceId: props.event.import_performance_id || '',
        ticketImportLogs: props.ticketImportLogs || [],
        loaded: true,
        adminChecksSearch: '',
        selectedHaloCheckIds: [],
        modifyHaloCheck: null,
        deleteCheckDialogRef: null,
        isPublicReportingEnabled: props.event.public_report,
      }
    }

    if (state.loaded && props.status === 'saved') {
      props.dispatch(refreshEvent())
      if (props.newEvent) {
        props.history.push(ROUTES.Private.AdminEvents)
        return null
      }

      return { loaded: false }
    }
    return null
  }

  componentDidMount() {
    const { dispatch } = this.props

    if (this.props?.match?.params?.id) {
      dispatch(getEventAction(this.props.match.params.id))
      dispatch(loadTicketImportLog(this.props.match.params.id))
    }

    dispatch(loadClientsAction())
    dispatch(loadGroupsAction())
  }

  componentDidUpdate(prevProps) {
    const { adminChecks } = this.props

    if (prevProps.adminChecks !== adminChecks) {
      this.setState({ adminChecks })
    }
  }

  getClientUsers() {
    const { currentUser, users } = this.props
    const { clientId } = this.state

    if (currentUser.permission_role === USER_PERMISSIONS.ClientManager) {
      return users
    }

    return users.filter(
      user =>
        user.permission_role === USER_PERMISSIONS.CrestAdmin ||
        user.client.object_id === clientId,
    )
  }

  updateField(fieldName) {
    return value => {
      this.setState({ [fieldName]: value, stateChanged: true }, () => {
        if (fieldName === 'clientId') {
          const { dispatch } = this.props
          dispatch(getClientUsers(value))
        }
      })
    }
  }

  closeEvent() {
    const { dispatch, match, history } = this.props

    dispatch(
      closeEventAction(match.params.id, () => history.push('/admin/events')),
    )
    this.setState({ stateChanged: false })
  }

  saveEvent() {
    const {
      dispatch,
      duplicateEvent,
      match,
      currentUser,
      history,
      event,
    } = this.props

    const {
      startDate,
      endDate,
      capacityTotal,
      geofences,
      adminChecks,
      duplicatedChecks,
    } = this.state

    const data = {
      // id: duplicateEvent ? null : match.params.id,
      ...this.state,
      startDate: startDate && startDate.toISOString(),
      endDate: endDate && endDate.toISOString(),
      capacityTotal: parseInt(capacityTotal, 10) || null,
      initialGeoFences: this.props.geofences.map(geofence => ({
        ...geofence,
        id: duplicateEvent ? null : geofence.id,
      })),
      mutatedGeoFences: geofences.map(geofence => ({
        ...geofence,
        id: duplicateEvent ? null : geofence.id,
      })),
      duplicatedChecks,
      initialAdminChecks: this.props.adminChecks,
      mutatedAdminChecks: adminChecks,
      currentUser,
      staff: event?.staff,
    }

    if (duplicateEvent) {
      data.id = null
    } else if (!!match.params.id) {
      data.id = match.params.id
    }

    dispatch(
      saveEvent(data, id => {
        const { event } = this.props
        this.setState({ id })
        if (!event) {
          history.push(ROUTES.Private.AdminEvents)
        }
      }),
    )

    this.setState({ stateChanged: false })
  }

  formatDateString(date) {
    return moment(date).format('DD/MM/YYYY HH:mm:ss')
  }

  getHaloChecksTableData() {
    const { adminChecks } = this.state
    if (!adminChecks) {
      return []
    }

    return adminChecks.map(check => ({
      id: check.object_id || check.id,
      title: check.title,
      descriptionString: check.description || check.descriptionString,
      zones: check.zones,
      type: check.event_type || check.type,
      recurringPeriod: check.recurring_period || check.recurringPeriod,
      startAt: check.start_at || check.startAt,
      startAtTime: check.start_at_time || check.startAtTime,
      recurringEndAt: check.recurring_end_at || check.recurringEndAt,
      recurringEndAtTime:
        check.recurring_end_at_time || check.recurringEndAtTime,
      users: check.users,
      image: check.image,
    }))
  }

  getNewCheckboxList = (ids, id, value) => {
    if (value) {
      return [...ids, id]
    }
    return ids.filter(listId => id !== listId)
  }

  openUploadDocumentDialog(check = null) {
    if (this.documentDialogRef && this.documentDialogRef.current) {
      this.documentDialogRef.current.show()
    }
  }

  async addNewHaloCheck(checkData) {
    const { dispatch } = this.props
    let check = {
      title: '',
      description: '',
      zones: [],
      event_type: '',
      recurring_period: '',
      start_at: '',
      start_at_time: '',
      recurring_end_at: '',
      recurring_end_at_time: '',
      image: '',
      users: [],
      adminCheckId: null,
    }

    check.title = checkData.title
    check.description = checkData.descriptionString
    check.zones = checkData.zones
    check.event_type = checkData.type
    check.recurring_period = checkData.recurringPeriod
    check.start_at = checkData.startAt
    check.start_at_time = checkData.startAtTime
    check.recurring_end_at = checkData.recurringEndAt
    check.recurring_end_at_time = checkData.recurringEndAtTime
    check.users = checkData.users
    check.adminCheckId = checkData.id || null

    if (checkData.image?.url) {
      delete check.image
    } else {
      if (checkData.image)
        check.image = await utils.base64EncodeFile(checkData.image)
    }
    if (checkData.id) {
      dispatch(updateHaloCheck(check))
    } else {
      dispatch(createHaloCheck(check))
    }
  }

  deleteHaloChecks(checks) {
    const { dispatch } = this.props
    const adminChecks = [...this.state.adminChecks]
    checks.forEach(check => {
      const ind = adminChecks.findIndex(el => el.object_id === check.id)
      if (ind === -1) {
        return
      }

      adminChecks.splice(ind, 1)
    })

    this.setState({
      adminChecks,
      selectedHaloCheckIds: [],
    })
    dispatch(deleteHaloChecks(checks))
  }

  confirmHaloChecksDeletion(checks) {
    const { deleteCheckDialogRef } = this

    if (deleteCheckDialogRef && deleteCheckDialogRef.current) {
      deleteCheckDialogRef.current.show(checks)
    }
  }

  duplicateHaloChecks(checks) {
    this.setState(prevState => ({
      adminChecks: [...prevState.adminChecks, ...checks],
      duplicatedChecks: checks,
      selectedHaloCheckIds: [],
    }))
    for (let idx in checks) {
      let newCheck = checks[idx]
      delete newCheck.id
      this.addNewHaloCheck(newCheck)
    }
  }

  /**
   * Get Moment object from Date and Time
   * @param {Date} date
   * @param {string} time = Time in the format of HH:mm
   */
  getMomentFromDateAndTime(date, time) {
    const m = moment(date).startOf('day')
    const [hour, minutes] = time.split(':')

    m.hour(parseInt(hour, 10)).minutes(parseInt(minutes, 10))

    return m
  }

  getStartDateError() {
    const { startDate, endDate, adminChecks } = this.state
    if (startDate && endDate) {
      if (startDate.isAfter(endDate)) {
        return 'Start date should be before end date.'
      }

      if (adminChecks?.length) {
        const anySooner = adminChecks
          .map(check =>
            this.getMomentFromDateAndTime(
              check.startAt || check.start_at,
              check.startAtTime || check.start_at_time,
            ),
          )
          .find(m => m.isBefore(startDate))

        if (anySooner) {
          return `There is at least one check with an earlier start date. (${anySooner.format(
            'DD/MM/YYYY HH:mm',
          )})`
        }
      }
    }

    return ''
  }

  getEndDateError() {
    const { startDate, endDate, adminChecks } = this.state
    if (startDate && endDate) {
      if (endDate.isBefore(startDate)) {
        return 'End date should be after start date.'
      }

      if (adminChecks?.length) {
        const anyLater = adminChecks
          .map(check =>
            this.getMomentFromDateAndTime(
              check.recurringEndAt ||
                check.recurring_end_at ||
                check.startAt ||
                check.start_at,
              check.recurringEndAtTime ||
                check.recurring_end_at_time ||
                check.startAtTime ||
                check.start_at_time,
            ),
          )
          .find(m => m.isAfter(endDate))

        if (anyLater) {
          return `There is at least one check with a later end date. (${anyLater.format(
            'DD/MM/YYYY HH:mm',
          )})`
        }
      }
    }

    return ''
  }

  reloadHaloChecks = addedChecks => {
    this.setState(prevState => ({
      adminChecks: addedChecks,
      isChecksUploaded: true,
    }))
  }

  toggleHaloChecksLoadingModal = type => {
    const { dispatch } = this.props
    dispatch(type === 'open' ? openDialog({ type: 'uploader' }) : closeDialog())
  }

  loadMoreChecks = pageNo => {
    const { adminChecks, totalChecks } = this.props

    const { adminChecksSearch } = this.state
    const tabIdx = this.selectedTabIdx.current.state.selectedTabIndex
    const noAdditionalChecks = adminChecks.length === totalChecks

    if (tabIdx === 3 && !noAdditionalChecks) {
      const { dispatch, pageCount } = this.props
      if (pageNo + 1 <= pageCount && pageNo + 1 > 0) {
        this.setState({
          currentPageNo: pageNo,
        })
        dispatch(loadMoreHaloChecks(pageNo + 1, adminChecksSearch))
      }
    }
  }

  searchHaloChecks = value => {
    this.setState({ adminChecksSearch: value }, async () => {
      const { adminChecksSearch } = this.state
      const { event, dispatch } = this.props
      const { results, nextPageNo } = await getHaloChecks(
        event.object_id,
        nextPageNo,
        adminChecksSearch,
      )

      dispatch(searchHaloChecks(results, nextPageNo))
    })
  }

  openUploadDocumentDialog = (document = null) => {
    this.setState({ documentData: document })

    if (this.documentDialogRef && this.documentDialogRef.current) {
      this.documentDialogRef.current.show()
    }
  }

  handleDocumentSubmit = data => {
    let fileUpload = {}
    //If A file is going to be pushed
    if (data.file !== '') {
      fileUpload = {
        fileName: data.name,
        file: data.file,
        fileData: data.fileData,
        type: data.file?.name.split('.')[1],
      }
    }
    const document = {
      docName: data.name,
      eventId: this.props.event.object_id,
      details: data.details,
      assignRole: data.assignRole,
      date: new Date(data.date),
      mandatory: data.mandatory,
      ...fileUpload,
    }

    console.log(document)

    if (data.update) {
      document.id = data.id
      document.oldData = data.oldData
      document.fileName = data.name
      axios.put(`${DOCUMENTS_SERVER.env}/update`, document, {
        headers: {
          "x-api-key": DOCUMENT_API_KEY.env
        }
      })
        .then(res => {
          console.log('pushed document')
          this.setState({ noDocs: false })
          this.setState({ documentLoading: true })
          this.documentDialogRef.current.hide()
        })
        .catch(e => console.log(e))
    } else {
      axios.post(`${DOCUMENTS_SERVER.env}/upload`, document, {
        headers: {
          "x-api-key": DOCUMENT_API_KEY.env
        }
      })
        .then(res => {
          console.log('pushed document')
          this.setState({ noDocs: false })
          this.setState({ documentLoading: true })
          this.documentDialogRef.current.hide()
        })
        .catch(e => console.log(e))
    }
  }

  getDocumentByEventId = (eventId) => {
    axios.get(`${DOCUMENTS_SERVER.env}/doc/event/${eventId}`, {
      headers: {
        "x-api-key": DOCUMENT_API_KEY.env
      }
    }).then((res) => {
      let documents = res.data.data.map(x => {
        let date = moment(x.date)

          let assignRole = JSON.parse(x.assignRole)

          return { ...x, date, assignRole }
        })
        this.setState({ document: documents })
          this.setState({ noDocs: false })
          this.setState({ documentLoading: false })
        }).catch(e => {
          console.log(e)
          this.setState({ noDocs: true })
          this.setState({ document: null})
          this.setState({ documentLoading: false })
        })
  }

  handleDocumentDelectCheck = rows => {
    if (
      this.documentDeleteCheckDialogRef &&
      this.documentDeleteCheckDialogRef.current
    ) {
      this.documentDeleteCheckDialogRef.current.show(rows)
    }
  }

  handleDocumentDelete = async rows => {
    console.log(rows)
    /*rows.forEach(row => {
      axios.delete(`${DOCUMENTS_SERVER.env}/doc/${row}`)
    })*/
    this.setState({ documentLoading: true })
    for (const docId of rows) {
      await axios.delete(`${DOCUMENTS_SERVER.env}/doc/${docId}`, {
        headers: {
          "x-api-key": DOCUMENT_API_KEY.env
        }
      })
    }
    this.setState({ documentLoading: true })
  }

  handleDownloadDocument = (data) => {
    const document = {
      fileName: data.fileName,
      type: data.type,
      eventId: data.eventId
    }
    axios.post(`${DOCUMENTS_SERVER.env}/download`, document, {
      headers: {
        "x-api-key": DOCUMENT_API_KEY.env
      }
    })
    .then(res => {
        window.open(res.data.data.signedURL, '_blank').focus();
    })
  }

  render() {
    const {
      dispatch,
      event,
      newEvent,
      status,
      clients,
      clientId: overrideClientId,
      duplicateEvent,
      currentUser,
      ticketImportLog,
      users,
      groups,
    } = this.props

    if (!(event || newEvent)) {
      return <Loading centered />
    }

    const {
      haloCheckDialogRef,
      deleteCheckDialogRef,
      documentDialogRef,
      documentDeleteCheckDialogRef,
    } = this

    const {
      title,
      startDate,
      overview,
      address,
      endDate,
      stateChanged,
      geofences,
      zones,
      newZone,
      eventUserIds,
      shiftManagerId,
      capacityTotal,
      eventPin,
      eventCode,
      clientId: selectedClientId,
      brief,
      customLogo,
      isClosed,
      importPerformanceId,
      adminChecksSearch,
      selectedHaloCheckIds,
      modifyHaloCheck,
      isPublicReportingEnabled,
    } = this.state

    const clientId = overrideClientId || selectedClientId
    const client = clients.filter(({ object_id }) => object_id === clientId)[0]

    let importSettings = this.props.importSettings
      ? this.props.importSettings[clientId]
      : {}

    if (!importSettings) {
      importSettings = {}
    }

    const requiredFields =
      (clientId ||
        currentUser.permission_role === USER_PERMISSIONS.ClientManager) &&
      title &&
      eventCode &&
      eventPin &&
      startDate &&
      startDate.isBefore(endDate) &&
      eventPin.length === 4 &&
      (duplicateEvent ? title !== event.title : true) &&
      !geofences.some(({ name }) => name.trim().length === 0)

    const hasMultiGeofence =
      clientId || currentUser.permission_role === USER_PERMISSIONS.ClientManager
        ? utils.hasMultiGeoFence(client)
        : false

    const hasClientBranding =
      clientId || currentUser.permission_role === USER_PERMISSIONS.ClientManger
        ? utils.hasBranding(client)
        : false

    const adminChecks = this.getHaloChecksTableData()

    const staff = users.filter(user => eventUserIds.includes(user.object_id))
    return (
      <AdminPage>
        {stateChanged && (
          <Prompt message="You have unsaved changes, are you sure you want to leave?" />
        )}
        <WarnBeforeLeave enabled={stateChanged} />
        <AdminTitle>{title || 'Create Event'}</AdminTitle>
        {currentUser.permission_role === USER_PERMISSIONS.CrestAdmin && (
          <AdminClientSelector
            value={clientId}
            clients={clients}
            onChange={this.updateField('clientId')}
            editing={!newEvent}
            required="Please select a client."
          />
        )}
        <div className="admin-page__close-button">
          {!isClosed && !newEvent && (
            <AdminButton
              onClick={() => this.closeEvent()}
              disabled={status === 'saving'}
              variant={VARIANT.Secondary}
              hollow
            >
              Close Event
            </AdminButton>
          )}
        </div>
        <AdminTabCard ref={this.selectedTabIdx}>
          <AdminTabTitle>Details</AdminTabTitle>
          <AdminTabContent>
            <AdminForm>
              <AdminFormColumn size={2}>
                <AdminFormRow>
                  <AdminField
                    label="Event Name"
                    type="text"
                    placeholder=""
                    value={title}
                    onChange={this.updateField('title')}
                    required="Please enter an event name."
                  />
                </AdminFormRow>
                <AdminFormRow size={2}>
                  <AdminField
                    label="Venue Address"
                    type="textarea"
                    placeholder=""
                    value={address}
                    onChange={this.updateField('address')}
                  />
                </AdminFormRow>
                <AdminFormRow>
                  {utils.hasPublicReporting(client) && (
                    <AdminField
                      checkboxLabel="Public reporting"
                      type="checkbox"
                      checked={isPublicReportingEnabled}
                      onChange={() =>
                        this.setState(prevState => ({
                          ...prevState,
                          isPublicReportingEnabled: !prevState.isPublicReportingEnabled,
                          stateChanged: true,
                        }))
                      }
                    />
                  )}
                </AdminFormRow>
              </AdminFormColumn>
              <AdminFormColumn>
                <AdminFormRow>
                  <AdminField
                    label="Start Date"
                    type="datetime"
                    placeholder=""
                    value={startDate}
                    onChange={this.updateField('startDate')}
                    error={this.getStartDateError()}
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="End Date"
                    type="datetime"
                    placeholder=""
                    value={endDate}
                    onChange={this.updateField('endDate')}
                    error={this.getEndDateError()}
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Pin"
                    type="number"
                    placeholder=""
                    value={eventPin}
                    onChange={this.updateField('eventPin')}
                    required="Please enter a PIN."
                    error={
                      eventPin.length !== 4 ? 'PIN should be 4 digits' : ''
                    }
                  />
                </AdminFormRow>
              </AdminFormColumn>
              <AdminFormColumn size={2}>
                <AdminFormRow size={3}>
                  <AdminField
                    label="Event Overview"
                    type="textarea"
                    placeholder=""
                    value={overview}
                    onChange={this.updateField('overview')}
                  />
                </AdminFormRow>
              </AdminFormColumn>
              <AdminFormColumn>
                <AdminFormRow>
                  <AdminField
                    label="Estimated Capacity"
                    type="number"
                    placeholder=""
                    value={capacityTotal}
                    onChange={this.updateField('capacityTotal')}
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Event Code"
                    type="text"
                    placeholder=""
                    value={eventCode}
                    onChange={this.updateField('eventCode')}
                    required="Please enter an event code."
                  />
                </AdminFormRow>
                <AdminFormRow>
                  <AdminField
                    label="Brief"
                    type="file"
                    placeholder="Upload brief"
                    onChange={this.updateField('brief')}
                    value={brief}
                    allowedFileTypes={['pdf']}
                    maxSize={1024 * 1024} // 1mb
                    canRemove
                  />
                </AdminFormRow>
              </AdminFormColumn>
            </AdminForm>
            <table className="admin-form-table">
              <tbody>
                <tr>
                  <td>
                    {hasClientBranding && (
                      <AdminHeaderLogoUploadField
                        onChange={this.updateField('customLogo')}
                        value={customLogo}
                        event={event}
                        client={client}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </AdminTabContent>
          <AdminTabTitle>Location</AdminTabTitle>
          <AdminTabContent>
            {geofences.map((geofence, index) => (
              <AdminGeofence
                key={geofence.object_id || index}
                name={geofence.name}
                onNameChange={newName =>
                  this.setState({
                    geofences: geofences.map((changedGeofence, changedIndex) =>
                      changedIndex === index
                        ? { ...geofence, name: newName }
                        : changedGeofence,
                    ),
                    stateChanged: true,
                  })
                }
                points={geofence.points}
                onGeofenceChange={points =>
                  this.setState({
                    geofences: geofences.map((changedGeofence, changedIndex) =>
                      changedIndex === index
                        ? { ...geofence, points }
                        : changedGeofence,
                    ),
                    stateChanged: true,
                  })
                }
                onAddGeofence={
                  index === geofences.length - 1 &&
                  hasMultiGeofence &&
                  geofences.length < MAX_GEOFENCE_COUNT
                    ? () =>
                        this.setState({
                          geofences: [...geofences, { name: '', points: [] }],
                        })
                    : null
                }
                onDeleteGeofence={
                  hasMultiGeofence
                    ? () =>
                        this.setState({
                          geofences: geofences.filter(
                            (changedGeofence, changedIndex) =>
                              changedIndex !== index,
                          ),
                          stateChanged: true,
                        })
                    : null
                }
              />
            ))}
            {geofences.length === 0 && (
              <AdminButton
                onClick={() =>
                  this.setState({ geofences: [{ name: '', points: [] }] })
                }
              >
                Add Geofence
              </AdminButton>
            )}
          </AdminTabContent>
          <AdminTabTitle>Documents</AdminTabTitle>
          <AdminTabContent>
            <AdminEventDetailsDeleteDocument
              ref={documentDeleteCheckDialogRef}
              onDone={checks => this.handleDocumentDelete(checks)}
            />
            <AdminDocumentSelector
              openUpload={() => this.openUploadDocumentDialog()}
              eventId={event?.object_id}
              onDelete={this.handleDocumentDelectCheck}
              loading={this.state.documentLoading}
              setLoading={loading =>
                this.setState({ documentLoading: loading })
              }
              handleEditDocument={this.openUploadDocumentDialog}
              document={this.state.document}
              getDocumentByEventId={this.getDocumentByEventId}
              noDocs={this.state.noDocs}
              handleDownloadDocument={this.handleDownloadDocument}
              currentUser={currentUser}
            ></AdminDocumentSelector>
            <AdminInteractiveDialog ref={documentDialogRef}>
              <AdminDialogCreateDocument
                onDone={this.handleDocumentSubmit}
                onUpdate={this.handleUpdateDocument}
                document={this.state.documentData}
              ></AdminDialogCreateDocument>
            </AdminInteractiveDialog>
          </AdminTabContent>
          <AdminTabTitle>Zones</AdminTabTitle>
          <AdminTabContent>
            <AdminCard title="Zones">
              <AdminCardBody nopadding>
                <table className="zone-list">
                  <tbody>
                    {zones.map((zone, index) => (
                      // zones don't have ids, it's a dumb array of string
                      // eslint-disable-next-line react/no-array-index-key
                      <tr key={index}>
                        <td>
                          <AdminField
                            type="text"
                            placeholder="Click on the bin to delete"
                            value={zone}
                            onChange={value =>
                              this.setState({
                                zones: zones.map((changedZone, changedIndex) =>
                                  changedIndex === index ? value : changedZone,
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
                                zones: zones.filter(
                                  (changedZone, changedIndex) =>
                                    changedIndex !== index,
                                ),
                                stateChanged: true,
                              })
                            }
                            icon={BUTTON_ICONS.Delete}
                            variant={VARIANT.Secondary}
                            title="Delete"
                            hollow
                          />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <AdminField
                          type="text"
                          placeholder="Add Zone"
                          value={newZone}
                          onChange={value => {
                            this.setState({ newZone: value })
                          }}
                          onEnter={() => {
                            this.setState({
                              zones: zones.concat([newZone]),
                              newZone: '',
                              stateChanged: true,
                            })
                          }}
                        />
                      </td>
                      <td>
                        <ButtonWithIcon
                          onClick={() =>
                            this.setState({
                              zones: zones.concat([newZone]),
                              newZone: '',
                              stateChanged: true,
                            })
                          }
                          icon={BUTTON_ICONS.CreateHollow}
                          disabled={newZone === ''}
                          title="Create"
                          hollow
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </AdminCardBody>
            </AdminCard>
          </AdminTabContent>
          {utils.hasHaloChecks(client) ? (
            <>
              <AdminTabTitle>Tasks</AdminTabTitle>
              <AdminTabContent>
                {this.state.isChecksUploaded && (
                  <AdminNotification
                    message="Tasks successfully uploaded!"
                    bottom={0}
                    onClose={() => this.setState({ isChecksUploaded: false })}
                  />
                )}
                <AdminEventDetailsDeleteCheckDialog
                  ref={deleteCheckDialogRef}
                  onDone={checks => this.deleteHaloChecks(checks)}
                />

                <AdminInteractiveDialog ref={haloCheckDialogRef}>
                  <AdminDialogAddOrModifyHaloCheck
                    event={event}
                    zones={zones}
                    geofences={[]}
                    staffGroups={groups || []}
                    staff={staff}
                    onDone={data => {
                      haloCheckDialogRef.current.hide()
                      this.addNewHaloCheck(data)
                    }}
                    onClose={() => {
                      haloCheckDialogRef.current.hide()
                    }}
                    check={modifyHaloCheck}
                  />
                </AdminInteractiveDialog>

                {this.props.isAdminChecksLoading ? (
                  <Loading centered />
                ) : event && startDate?._i ? (
                  <>
                    <AdminTableHeader
                      reloadHaloChecks={this.reloadHaloChecks}
                      onCreateClick={() => this.openCreateHaloCheckDialog()}
                      toggleHaloChecksLoadingModal={
                        this.toggleHaloChecksLoadingModal
                      }
                      onUploadClick={() => {}}
                      onSelectClick={() => {}}
                      searchPlaceholder="Search checks"
                      search={adminChecksSearch}
                      onSearch={value => this.searchHaloChecks(value)}
                      globalActions={[
                        {
                          icon: BUTTON_ICONS.Delete,
                          title: 'Delete',
                          onClick: rows => this.confirmHaloChecksDeletion(rows),
                        },
                        {
                          icon: BUTTON_ICONS.CopyRed,
                          title: 'Copy',
                          onClick: rows => this.duplicateHaloChecks(rows),
                        },
                      ]}
                      selectedRows={selectedHaloCheckIds.map(id =>
                        adminChecks.find(check => check.id === id),
                      )}
                      hasRowsSelected={!!selectedHaloCheckIds.length}
                      eventId={event.object_id}
                    />
                    <AdminTableBody
                      headers={[
                        'Title',
                        'Locations',
                        'Assignee',
                        'Type',
                        'Time',
                        'Recurring',
                      ]}
                      columns={[
                        'title',
                        'zones',
                        'users',
                        'type',
                        'startAtTime',
                        'recurringPeriod',
                      ]}
                      customRenders={[
                        {
                          column: 'title',
                          render: check => (
                            <button
                              className="admin-button admin-button--link no-float"
                              onClick={() =>
                                this.openCreateHaloCheckDialog(check)
                              }
                            >
                              {check.title}
                            </button>
                          ),
                        },
                        {
                          column: 'zones',
                          render: check =>
                            check.zones && check.zones.length ? (
                              check.zones.join(', ')
                            ) : (
                              <span className="muted">No zones</span>
                            ),
                        },
                        {
                          column: 'users',
                          render: check => {
                            const names = check.users
                              ? check.users
                                  .map(id =>
                                    this.props.users.find(
                                      user => user.object_id === id,
                                    ),
                                  )
                                  .filter(Boolean)
                                  .map(user => user.name)
                                  .join(', ')
                              : null

                            return (
                              names || (
                                <span className="muted">No assignees</span>
                              )
                            )
                          },
                        },
                        {
                          column: 'startAtTime',
                          render: check => {
                            let time = check.startAtTime
                            if (
                              check.recurringPeriod !==
                                RECURRING_PERIOD.Never &&
                              check.recurringEndAtTime
                            ) {
                              time += ' - ' + check.recurringEndAtTime
                            }

                            return time
                          },
                        },
                        {
                          column: 'type',
                          render: check =>
                            CHECK_TYPE_TEXT[check.type] || check.type,
                        },
                        {
                          column: 'recurringPeriod',
                          render: check =>
                            RECURRING_PERIOD_TEXT[check.recurringPeriod] ||
                            check.recurringPeriod,
                        },
                      ]}
                      selectedRowIds={selectedHaloCheckIds}
                      onAllCheckboxChange={value => {
                        return this.setState({
                          selectedHaloCheckIds: value
                            ? [...adminChecks.map(check => check.id)]
                            : [],
                        })
                      }}
                      onRowCheckboxChange={(row, value) =>
                        this.setState({
                          selectedHaloCheckIds: this.getNewCheckboxList(
                            selectedHaloCheckIds,
                            row.id,
                            value,
                          ),
                        })
                      }
                      showCheckboxes
                      data={adminChecks}
                      rowPerPage={adminChecks.length}
                      currentPage={this.state.currentPageNo}
                    />
                    <AdminTableFooter
                      totalPageCount={this.props.pageCount}
                      currentPage={this.state.currentPageNo}
                      onPreviousPageClick={() => {
                        this.loadMoreChecks(this.state.currentPageNo - 1)
                      }}
                      onNextPageClick={() => {
                        this.loadMoreChecks(this.state.currentPageNo + 1)
                      }}
                      onPageClick={page => {
                        this.loadMoreChecks(page)
                      }}
                    />
                  </>
                ) : (
                  <AdminEmptyPage
                    title="You'll be able to add checks here once the event has been created."
                    description="Please continue with the creation process and revisit this section afterwards."
                  />
                )}
              </AdminTabContent>
            </>
          ) : null}
          <AdminTabTitle>People</AdminTabTitle>
          <AdminTabContent>
            <AdminStaffSelector
              onStaffCreateClick={
                utils.isUserAllowedToCreateUsers(
                  this.props.currentUser,
                  this.props.staffCounts,
                )
                  ? onUserCreated =>
                      dispatch(
                        openDialog({
                          type: DIALOG_TYPE.CreateUser,
                          onUserCreated,
                          clientId,
                        }),
                      )
                  : null
              }
              onStaffEditClick={userId =>
                dispatch(openDialog({ type: DIALOG_TYPE.EditUser, userId }))
              }
              currentUser={this.props.currentUser}
              staffCounts={this.props.staffCounts}
              users={this.getClientUsers()}
              eventUserIds={eventUserIds}
              onChange={userIds => {
                this.setState(
                  userIds.includes(shiftManagerId)
                    ? { eventUserIds: userIds, stateChanged: true }
                    : {
                        eventUserIds: userIds,
                        stateChanged: true,
                        shiftManagerId: '',
                      },
                )
              }}
              shiftManagerId={shiftManagerId}
              onShiftManagerChanged={userId =>
                this.setState({ shiftManagerId: userId, stateChanged: true })
              }
            />
          </AdminTabContent>
          {client?.enabled_features.includes('ticketScanning') && (
            <>
              <AdminTabTitle>Audience View</AdminTabTitle>
              <AdminTabContent>
                <AdminForm>
                  <AdminFormColumn size={3}>
                    <AdminFormRow>
                      <AdminField
                        label="Event Code"
                        type="input"
                        placeholder={`Add event code from AudienceView`}
                        value={importPerformanceId}
                        onChange={this.updateField('importPerformanceId')}
                      />
                    </AdminFormRow>
                    <AdminFormRow>
                      {!newEvent && ticketImportLog ? (
                        <div>
                          <p>
                            Last import:{' '}
                            {`${this.formatDateString(
                              ticketImportLog.finished_at,
                            )}`}
                          </p>
                          <p>
                            Status:{' '}
                            {ticketImportLog.status === 'imported'
                              ? 'Success'
                              : 'Failed'}
                          </p>
                          <p>
                            {/* removing below as don't think is needed/unsure on purpose */}
                            {/* {ticketImportLog.status === 'failed'
                              ? `Error: ${
                                  lastAttemptedImportLogs.length > 0
                                    ? lastAttemptedImportLogs[
                                        lastAttemptedImportLogs.length - 1
                                      ]
                                    : 'Unknown'
                                }`
                              : ''} */}
                          </p>
                        </div>
                      ) : (
                        <p>Last import: No imports attempted</p>
                      )}
                    </AdminFormRow>
                  </AdminFormColumn>
                </AdminForm>
              </AdminTabContent>
            </>
          )}
        </AdminTabCard>
        <AdminSavePanel>
          <AdminButton
            onClick={() => this.saveEvent()}
            loading={this.props.isSaving}
            disabled={!stateChanged || !requiredFields}
          >
            Save
          </AdminButton>
        </AdminSavePanel>
      </AdminPage>
    )
  }
}
export default compose(
  withUserContext,
  connect((state, props) => {
    const event = state.activeEvent.data
    const { newEvent } = props

    let clientId = ''
    let importSettings = ''

    if (!newEvent) {
      clientId = event?.client?.object_id
    } else if (
      !props.match.params.id &&
      props.currentUser.permission_role === USER_PERMISSIONS.ClientManager
    ) {
      clientId = props.currentUser.client.object_id
    }

    if (state.ticketScanning.data) {
      importSettings = state.ticketScanning.data
    }

    return {
      event,
      adminChecks: event?.checks?.results || [],
      totalChecks: event?.checks?.count,
      nextPageHaloChecks: event?.checks?.nextPageNo,
      pageCount: Math.ceil(event?.checks?.count / 20) || 0,
      isLoading: state.activeEvent.isLoading,
      isLoadingMoreData: state.activeEvent.isLoadingMoreData,
      isSaving: state.activeEvent.isSaving,
      importSettings: state.ticketScanning.data,
      users: event?.staff || [],
      staffCounts: state.clients.extraData.staffCounts,
      clientId,
      clients: Object.values(state.clients.data),
      ticketScanningSettings: importSettings,
      ticketImportLog: state.ticketImportLogs,
      status: state.events.status,
      geofences: !newEvent && event?.locations?.length ? event.locations : [],
      groups:
        state.groups.status === 'loaded'
          ? Object.values(state.groups.data).filter(
              group => group.client.object_id === clientId,
            )
          : null,
      isAdminChecksLoading: state.activeEvent.isLoading,
    }
  }),
)(AdminEventDetailPage)
