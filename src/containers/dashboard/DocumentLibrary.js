import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Panel } from '../../components/common'
import PropTypes from 'prop-types'
import {
  DashboardSlidingPanel,
  DashboardDialogPanel,
} from '../../components/Dashboard'
import AdminDocumentUploadPage from '../admin/AdminDocumentUploadPage'
import axios from "axios";
import moment from 'moment'
import { DOCUMENTS_SERVER, DOCUMENT_API_KEY } from '../../settings'
import { AdminCard, AdminDocumentSelector, AdminPage, AdminTabContent, AdminTabTitle, AdminTitle } from '../../components/common/Admin';
import AdminEventDetailsDeleteDocument from '../admin/AdminEventDetailsDeleteDocument';
import AdminInteractiveDialog from '../../components/common/Admin/AdminInteractiveDialog';
import { AdminDialogCreateDocument } from '../../components/common/Admin/Dialog';
import Parse from 'parse'
import { getCurrentUser } from '../../utils/helpers'

class DocumentLibrary extends Component {

    static propTypes = {
        dispatch: PropTypes.func.isRequired,
      }

      static defaultProps = {}

    
      constructor(props) {
        super(props)
        console.log('props in documentlibrary',props)
    
        this.documentDialogRef = new React.createRef()
        this.documentDeleteCheckDialogRef = new React.createRef();
    
        this.state = {
          documentLoading: true,
          documentData: null,
          document: null,
          noDocs: false,
          event: this.props.match.params.id,
          currentUser: getCurrentUser()
        }
      }
    
      openUploadDocumentDialog(check = null) {
        if (this.documentDialogRef && this.documentDialogRef.current) {
          this.documentDialogRef.current.show()
        }
      }
    
      openUploadDocumentDialog = (document = null) => {
        this.setState({ documentData: document });
    
        if (this.documentDialogRef && this.documentDialogRef.current) {
          this.documentDialogRef.current.show()
        }
      }
    
      handleDocumentSubmit = (data) => {
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
          eventId: this.state.event,
          details: data.details,
          assignRole: data.assignRole,
          date: new Date(data.date),
          mandatory: data.mandatory,
          ...fileUpload
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
        axios.get(`${DOCUMENTS_SERVER.env}/doc/event/${eventId}`,{
            headers:{
                "x-api-key": DOCUMENT_API_KEY.env
            }
        }).then((res) => {
            console.log({res})
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
    
      handleDocumentDelectCheck = (rows) => {
        if (this.documentDeleteCheckDialogRef && this.documentDeleteCheckDialogRef.current) {
          this.documentDeleteCheckDialogRef.current.show(rows)
        }
      }
    
      handleDocumentDelete = async (rows) => {
        console.log(rows)
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
        event,
      } = this.state
  
      const { documentDialogRef, documentDeleteCheckDialogRef } = this
      console.log('props',this.props)

    return (
        <div className="document-library">
        <DashboardSlidingPanel allowClosedIncident />
        <DashboardDialogPanel />
        <AdminPage>
        <AdminTitle>Document Library</AdminTitle>
        <AdminCard
          className="admin-ticket-scanning-page__details"
        >
          <AdminTabContent>
            <AdminEventDetailsDeleteDocument
              ref={documentDeleteCheckDialogRef}
              onDone={checks => this.handleDocumentDelete(checks)}
            />
            <AdminDocumentSelector
              openUpload={() => this.openUploadDocumentDialog()}
              eventId={event}
              onDelete={this.handleDocumentDelectCheck}
              loading={this.state.documentLoading}
              setLoading={(loading) => this.setState({ documentLoading: loading })}
              handleEditDocument={this.openUploadDocumentDialog}
              document={this.state.document}
              getDocumentByEventId={this.getDocumentByEventId}
              noDocs={this.state.noDocs}
              handleDownloadDocument={this.handleDownloadDocument}
              currentUser={this.state.currentUser}
            ></AdminDocumentSelector>
            <AdminInteractiveDialog ref={documentDialogRef}>
              <AdminDialogCreateDocument
                onDone={this.handleDocumentSubmit}
                onUpdate={this.handleUpdateDocument}
                document={this.state.documentData}>
              </AdminDialogCreateDocument>
            </AdminInteractiveDialog>
          </AdminTabContent>
        </AdminCard>
      </AdminPage>
      </div>
    )
  }
}

export default connect(state => ({
}))(DocumentLibrary)
