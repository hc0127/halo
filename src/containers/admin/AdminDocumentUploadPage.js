import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Parse from 'parse'

import {
  AdminCard,
  AdminCardBody,
  AdminField,
  AdminButton,
  AdminTitle,
  AdminPage,
  AdminClientSelector,
  AdminDocumentSelector,
} from '../../components/common/Admin'
import { withUserContext } from '../../Contexts'
import {
  AdminForm,
  AdminFormRow,
  AdminFormColumn,
} from '../../components/AdminForm'

import {
  IMPORT_TYPE_OPTIONS,
  IMPORT_TYPE_FIELDS,
  USER_PERMISSIONS,
} from '../../utils/constants'
import AdminSavePanel from '../../components/common/Admin/AdminSavePanel'
import { compose } from 'redux'
import { loadClientsAction } from '../../stores/ReduxStores/admin/clients'
import utils from '../../utils/helpers'
import AdminEventDetailsDeleteDocument from './AdminEventDetailsDeleteDocument'
import AdminInteractiveDialog from '../../components/common/Admin/AdminInteractiveDialog'
import { AdminDialogCreateDocumentGlobal } from '../../components/common/Admin/Dialog'
import { DOCUMENTS_SERVER, DOCUMENT_API_KEY } from '../../settings'
import axios from 'axios'
import moment from 'moment'
import { loadEventsAction } from '../../stores/ReduxStores/admin/events'

class AdminDocumentUploadPage extends Component {
  constructor(props) {
    super(props)

    this.documentDialogRef = new React.createRef()
    this.documentDeleteDocumentDialogRef = new React.createRef();

    this.state = {
      loaded: false,
    }
    this.props.dispatch(loadEventsAction())
  }

  openUploadDocumentDialog = (document = null) => {
    this.setState({ documentData: document });

    if (this.documentDialogRef && this.documentDialogRef.current) {
      this.documentDialogRef.current.show()
    }
  }

  handleDocumentSubmit = (data) => {
    console.log({ data })
    let fileUpload = {}
    //If A file is going to be pushed
    if (data.file !== '') {
      fileUpload = {
        fileName: data.name,
        file: data.file,
        fileData: data.fileData,
        type: data.file?.name.split(".")[1],
      }
    }
    const document = {
      docName: data.name,
      eventId: data.eventId,
      details: data.details,
      assignRole: data.assignRole,
      date: new Date(data.date),
      mandatory: data.mandatory,
      ...fileUpload
    }
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

  getDocumentList = () => {
    axios.get(`${DOCUMENTS_SERVER.env}/doc`, {
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
      this.setState({ document: null })
      this.setState({ documentLoading: false })
    })
  }

  handleDocumentDelectDocument = (rows) => {
    if (this.documentDeleteDocumentDialogRef && this.documentDeleteDocumentDialogRef.current) {
      this.documentDeleteDocumentDialogRef.current.show(rows)
    }
  }

  handleDocumentDelete = async (rows) => {
    console.log(rows)
    /*rows.forEach(row => {
      axios.delete(`${DOCUMENTS_SERVER.env}/doc/${row}`)
    })*/
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
      clients,
      events
    } = this.props
    const { documentDialogRef, documentDeleteDocumentDialogRef } = this

    return (
      <AdminPage>
        <AdminTitle>Document Library</AdminTitle>
        <AdminCard
          className="admin-ticket-scanning-page__details"
          title="Details"
        >
          <AdminCardBody>
            <AdminEventDetailsDeleteDocument
              ref={documentDeleteDocumentDialogRef}
              onDone={docs => this.handleDocumentDelete(docs)}
            />
            <AdminDocumentSelector
              openUpload={() => this.openUploadDocumentDialog()}
              eventId={'global'}
              onDelete={this.handleDocumentDelectDocument}
              loading={this.state.documentLoading}
              setLoading={(loading) => this.setState({ documentLoading: loading })}
              handleEditDocument={this.openUploadDocumentDialog}
              document={this.state.document}
              getDocumentByEventId={this.getDocumentList}
              noDocs={this.state.noDocs}
              events={this.props.events}
              handleDownloadDocument={this.handleDownloadDocument}
              currentUser={this.props.currentUser}
            ></AdminDocumentSelector>
            <AdminInteractiveDialog ref={documentDialogRef}>
              <AdminDialogCreateDocumentGlobal
                onDone={this.handleDocumentSubmit}
                onUpdate={this.handleUpdateDocument}
                document={this.state.documentData}
                events={this.props.events}>
              </AdminDialogCreateDocumentGlobal>
            </AdminInteractiveDialog>
          </AdminCardBody>
        </AdminCard>
      </AdminPage>
    )
  }
}

AdminDocumentUploadPage.propTypes = {
  clients: PropTypes.array.isRequired,
  events: PropTypes.array.isRequired,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired
}

export default compose(
  withUserContext,
  connect(state => {
    return {
      clients: Object.values(state.clients.data),
      events: Object.values(state.events.data),
      //currentuser: Object.values(state.currentUser)
    }
  }),
)(AdminDocumentUploadPage)
