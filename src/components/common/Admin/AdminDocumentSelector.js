import React, { Component, useState, useEffect } from 'react'
import { AdminCard, AdminCardBody } from '.'
import { BUTTON_ICONS, VARIANT, USER_PERMISSIONS } from '../../../utils/constants'
import ButtonWithIcon from '../ButtonWithIcon'
import { AdminTableHeaderSecond, AdminTableBody, AdminTableSelectionPanel } from '../../AdminTable'
import axios from 'axios';
import {DOCUMENTS_SERVER} from "../../../settings";
import Loading from '../../../components/common/Loading/Loading';
import moment from 'moment'


const AdminDocumentSelector = (props) => {
  const [documentSearch, setDocumentSearch] = useState('');
  const [documentFilter, setDocumentFilter] = useState('');
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);

  const {openUpload, 
    eventId, 
    onDelete, 
    loading, 
    setLoading, 
    handleEditDocument, 
    document, 
    getDocumentByEventId, 
    noDocs, 
    handleDownloadDocument,
    currentUser} = props;

  const [localList, setLocalList] = useState([])

  useEffect(() => {
    if(loading && eventId && !noDocs) {
      getDocumentByEventId(eventId)
    } else if(!document && !noDocs){
      setLoading(true)
    }
    if(document){
      console.log({document})
      setLocalList(document)
    }else{
      setLocalList([])
    }
  }, [loading])

  //! function
  const getNewCheckboxList = (ids, id, value) => {
    if (value) {
      return [...ids, id]
    }
    return ids.filter(listId => id !== listId)
  }

  const filteringDataSearch = (value) =>{
      setDocumentSearch(value)
      filteringData(value, documentFilter)
  }

  const filteringDataFilter = (value) =>{
    setDocumentFilter(value)
    filteringData(documentSearch, value)
  }

  const filteringData = (search, filter) =>{
    let tempDocument = document
    if(search !== '' && filter !== ''){
      let temp = tempDocument.filter(doc => doc.docName.match(search) && doc.eventId === filter)
      setLocalList(temp)
    }else if(search !== ''){
      let temp = tempDocument.filter(doc => doc.docName.match(search))
      setLocalList(temp)
    }else if(filter !== ''){
      let temp = tempDocument.filter(doc => doc.eventId === filter)
      setLocalList(temp)
    }else{
      setLocalList(document)
    }
  }

  console.log({props})

  return (
    <div className="admin-document-selector">
      <AdminTableHeaderSecond
        onCreateClick={() => openUpload()}
        searchPlaceholder="Search Documents"
        search={documentSearch}
        onSearch={value => filteringDataSearch(value)}
        filterPlaceholder="Filter Documents"
        filter={documentFilter}
        onFilter={value => filteringDataFilter(value)}
        eventsData={props.events}
        afterGlobalAction={() => setSelectedDocumentIds([])}
        globalActions={[
          {
            icon: BUTTON_ICONS.Delete,
            title: 'Delete',
            onClick:(rows) => onDelete(rows),
          },
        ]}
        selectedRows={selectedDocumentIds}
        hasRowsSelected={!!selectedDocumentIds.length}
      />
      {
        loading? <div className="loading">
          <Loading/>
        </div>:( localList &&
        <AdminTableBody
        headers={eventId === 'global' ? ['Documents', 'Upload Date', 'Assign role', 'Event'] : ['Documents', 'Upload Date', 'Assign role']}
        selectedRowIds={selectedDocumentIds}
        columns={eventId === 'global' ?[
          'docName',
          'date',
          'assignRole',
          'eventId',
          'edit',
        ]:[
          'docName',
          'date',
          'assignRole',
          'edit',
        ]}
        onRowCheckboxChange={(row, value)=> setSelectedDocumentIds(getNewCheckboxList(selectedDocumentIds, row.id, value))}
        data={localList}
        showCheckboxes
        customRenders={eventId === 'global' ?[
          {
            column: 'docName',
          render: check => (
            <button
              className="admin-button admin-button--link no-float"
              onClick={() =>
                handleDownloadDocument(check)
              }
            >
              {check.docName}
            </button>
          )
        },
        {
          column: 'date',
          render: check =>{
            if(check.date) {
              return moment(check.date).format('DD/MM/YY')
            } else {
              return (<span className="muted">No Date</span>)
            }
          }
        },
        {
          column: 'assignRole',
          render: check =>
            check.assignRole && check.assignRole.length > 0 ? (
              check.assignRole.join(', ')
            ) : (
              <span className="muted">None</span>
            ),
        },
        {
          column: 'eventId',
          render: check =>{
            console.log(props)
            let found = props.events.find(x => x.object_id === check.eventId)
            console.log(found)
            if(found){
              return found.title
            }
            return check.eventId
          }
        },
        {
          column: 'edit',
          render: check =>(
            <button
              className='admin-button no-float'
              hidden={
                currentUser.permission_role !== USER_PERMISSIONS.CrestAdmin &&
                currentUser.permission_role !== USER_PERMISSIONS.ClientManager
              }
              onClick={() =>
                handleEditDocument(check)
              }
              >
                Edit
              </button>
          )
        }
        ]:[
          {
            column: 'docName',
          render: check => (
            <button
              className="admin-button admin-button--link no-float"
              onClick={() =>
                handleDownloadDocument(check)
              }
            >
              {check.docName}
            </button>
          )
        },
        {
          column: 'date',
          render: check =>{
            if(check.date) {
              return moment(check.date).format('DD/MM/YY')
            } else {
              return (<span className="muted">No Date</span>)
            }
          }
        },
        {
          column: 'assignRole',
          render: check =>
            check.assignRole && check.assignRole.length > 0 ? (
              check.assignRole.join(', ')
            ) : (
              <span className="muted">None</span>
            ),
        },
        {
          column: 'edit',
          render: check =>(
            <button
              className='admin-button no-float'
              hidden={
                currentUser.permission_role !== USER_PERMISSIONS.CrestAdmin &&
                currentUser.permission_role !== USER_PERMISSIONS.ClientManager
              }
              onClick={() =>
                handleEditDocument(check)
              }
              >
                Edit
              </button>
          )
        }
        ]}
      />
      )}
    </div>
  )
}

export default AdminDocumentSelector