import React, { Component, useEffect, useRef, useState } from 'react'

import { AdminField, AdminTitle, AdminButton } from '../index'
import { AdminForm, AdminFormColumn, AdminFormRow } from '../../../AdminForm'
import NiceCheckbox from '../../../AdminTable/NiceCheckbox';
import { VARIANT } from '../../../../utils/constants'
import moment from 'moment';

const AdminDialogCreateDocumentGlobal = (props) => {

  const [data, setData] = useState({
    assignRole: [],
    name: "",
    details: "",
    date: "",
    mandatory: false,
    file: "",
    id: "",
    fileData: ""
  })
  const inputRef = useRef();

  const [loading, setLoading] = useState(false);

  const { onDone, document, onUpdate, events } = props;

  const validFormats = [
    'image/png',
    'application/pdf',
    'image/jpeg'
  ]

  useEffect(() => {
    console.log(document ? 'old' : 'new')
    if (document) {
      setData(prev => (
        {
          ...prev,
          name: document.docName,
          details: document.details,
          id: document.id,
          date: document.date ? document.date : '',
          mandatory: document.mandatory ? document.mandatory : false,
          assignRole: document.assignRole ? document.assignRole : [],
          eventId: document.eventId,
          update: true,
          oldData: {eventId: document.eventId, type: document.type, docName: document.docName, fileName: document.fileName},
          type: document.type
        }
      ))
      console.log({document})
    }
  }, document)


  const handleCheckChange = (check, e) => {
    let assignRole = data.assignRole ? data.assignRole : [];
    if (check) {
      assignRole.push(e);
    } else {
      assignRole = assignRole.filter(data => data != e);
    }
    setData(prev => ({ ...prev, assignRole: assignRole }))
  }

  const updateField = (fieldName) => {
    return value => {
      setData(prev => ({ ...prev, [fieldName]: value }))
    }
  }

  const handleFileChange = (e) => {
    let file = e.target.files[0]
    const reader = new FileReader();
    reader.readAsDataURL(file)
    reader.onload = (e) =>{
      let type = e.target.result.split(';')[0].split(':')[1]
      setData(prev => ({ ...prev, file: file, fileData: e.target.result, type: type }))
      if(!validFormats.includes(type)){
        handleCheckChange(false, 'app')
      }
    }
  }

  const openFileExplorer = () => {
    inputRef.current.click()
  }

  return (
    <div className="admin-dialog-document">
      <AdminTitle>Upload Documents</AdminTitle>
      <AdminForm>
        <AdminFormRow size={2}>
          <AdminFormColumn>
            <AdminField
              label="Document Name"
              type="text"
              required="This field is required."
              value={data.name}
              onChange={updateField('name')}
            />
            <AdminField label="Document Details" type="textarea" value={data.details}
              onChange={updateField('details')} />
          </AdminFormColumn>
          <AdminFormColumn>
            <div className='checkbox'>
              <p>Assign Role</p>

              <div className='list'>
                <div className='item'>
                  <NiceCheckbox checked={data.assignRole.includes('admin')} onChange={(e) => handleCheckChange(e, 'admin')} />
                  <label>Admin</label>
                </div>
                <div className='item'>
                  <NiceCheckbox disabled={data.type && !validFormats.includes(data.type)} checked={data.assignRole.includes('app')} onChange={(e) => handleCheckChange(e, 'app')} />
                  <label>App</label>
                </div>
                <div className='item'>
                  <NiceCheckbox checked={data.assignRole.includes('dash')} onChange={(e) => handleCheckChange(e, 'dash')} />
                  <label>Dash</label>
                </div>
              </div>
            </div>
          </AdminFormColumn>
          <AdminFormColumn>
            <div className="right-control">
              <div className="date">
                <label className="label">Date</label>
                <AdminField
                  type="date"
                  value={data.date}
                  onChange={updateField('date')}
                />
              </div>
              <div className="mandatory">
                <label className="label">Mandatory</label>
                <AdminField
                  type="switch"
                  value={data.mandatory}
                  onChange={updateField('mandatory')}
                />
              </div>
              <div>
                <label className='label'>Event</label>
                <AdminField
                  placeholder="Please select"
                  type="dropdown"
                  value={data.eventId}
                  onChange={updateField('eventId')}
                  options={events.map(event => ({
                    value: event.object_id,
                    label: event.title,
                  }))}
                />
              </div>
              <div className='button'>
                <div>
                  <label >
                    {data.file ? data.file.name : "Upload file"}
                  </label>
                </div>

                <input
                  ref={inputRef}
                  onChange={(e) => {handleFileChange(e)}}
                  type="file"
                  style={{ display: 'none' }}
                  accept='.csv,.pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx'
                />
                <AdminButton
                  onClick={() => {
                    openFileExplorer()
                  }}>
                  Upload
                </AdminButton>
              </div>
              <div className='button'>
                <AdminButton
                  disabled={(!data.file || !data.name || !data.date || !data.details || !data.eventId) && !data.update}
                  onClick={() => {
                    onDone(data)
                    setLoading(true)
                  }}
                  loading={loading}
                  style={{marginLeft: 'auto'}}
                >
                  {data.update ? 'Update' : 'Save'}
                </AdminButton>
              </div>
            </div>
          </AdminFormColumn>
        </AdminFormRow>
      </AdminForm>
    </div>
  )
}

export default AdminDialogCreateDocumentGlobal
