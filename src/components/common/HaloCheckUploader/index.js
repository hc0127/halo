import React, { useState } from 'react'
import PropTypes from 'prop-types'

import AdminButton from '../Admin/AdminButton'
import AdminField from '../Admin/AdminField'

import { importCSV } from '../../../api/admin-checks'

import utils from '../../../utils/helpers'

export default function HaloCheckUploader({
  reloadHaloChecks,
  eventId,
  position,
  toggleHaloChecksLoadingModal,
}) {
  const [file, setFile] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleUploadCSV = async file => {
    try {
      const base64Str = await utils.base64EncodeFile(file)
      const formattedStr = base64Str.split(',')[1]
      setIsUploading(true)

      toggleHaloChecksLoadingModal('open')

      const addedChecks = await importCSV({ file: formattedStr, eventId })

      toggleHaloChecksLoadingModal('close')

      setIsUploading(false)
      reloadHaloChecks(
        addedChecks.map(check => ({
          ...check,
          start_at_time: check.start_at_time
            ? check.start_at_time.substring(0, 5)
            : null,
          recurring_end_at_time: check.recurring_end_at_time
            ? check.recurring_end_at_time.substring(0, 5)
            : null,
        })),
      )
    } catch (err) {
      alert(
        'Halo task csv not in correct format, please check and try uploading again',
      )

      toggleHaloChecksLoadingModal('close')
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    var anchor = document.createElement('a')
    anchor.setAttribute('href', '/halo-import-template.csv')
    anchor.setAttribute('download', '')
    document.body.appendChild(anchor)
    anchor.click()
    anchor.parentNode.removeChild(anchor)
  }

  return (
    <>
      <div className={`admin-table__btn-container-${position}`}>
        {position === 'right' && (
          <AdminButton
            style={{
              width: '400px',
            }}
            onClick={() => downloadTemplate()}
          >
            Download halo task template
          </AdminButton>
        )}
        <AdminField
          type="file"
          placeholder="Import tasks"
          allowedFileTypes={['csv']}
          value={file}
          onChange={file => setFile(file)}
          canRemove
        />
        <AdminButton
          style={{ width: '150px' }}
          disabled={!file}
          onClick={() => handleUploadCSV(file)}
          loading={isUploading}
        >
          Upload
        </AdminButton>
      </div>
      {position === 'center' && (
        <AdminButton
          style={{
            width: '250px',
            marginTop: position === 'center' && '15px',
          }}
          onClick={() => downloadTemplate()}
        >
          Download halo task template
        </AdminButton>
      )}
    </>
  )
}

HaloCheckUploader.propTypes = {
  reloadHaloChecks: PropTypes.func.isRequired,
  eventId: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired,
  toggleHaloChecksLoadingModal: PropTypes.func.isRequired,
}
