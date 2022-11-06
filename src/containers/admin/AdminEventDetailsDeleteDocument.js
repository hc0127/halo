import React, { forwardRef, useImperativeHandle, useState } from 'react'
import PropTypes from 'prop-types'
import { AdminButton, AdminTitle } from '../../components/common/Admin'
import { VARIANT } from '../../utils/constants'

const propTypes = {
  onDone: PropTypes.func.isRequired,
}

const AdminEventDetailsDeleteDocument = forwardRef(({ onDone }, ref) => {
  const [show, setShow] = useState(false)
  const [document, setDocument] = useState([])

  useImperativeHandle(ref, () => ({
    show(document) {
      setShow(true)
      setDocument(document)
    },
  }))

  const title = document.length === 1 ? 'Delete Document' : 'Delete Documents'
  const message =
  document.length === 1
      ? 'Deleting a document cannot be undone, are you sure you want to delete this document?'
      : 'Deleting documents cannot be undone, are you sure you want to delete these documents?'

  return show ? (
    <>
      <div className={`admin-dialog admin-dialog--open admin-dialog--confirm`}>
        <AdminTitle>{title}</AdminTitle>
        <div>{message}</div>
        <div className="button-panel">
          <AdminButton hollow onClick={() => setShow(false)}>
            Cancel
          </AdminButton>
          <AdminButton
            variant={VARIANT.Secondary}
            onClick={() => {
              setShow(false)
              onDone(document)
            }}
          >
            {title}
          </AdminButton>
        </div>
      </div>
      <button
        className={`admin-dialog-overlay admin-dialog-overlay--open`}
        onClick={() => setShow(false)}
      />
    </>
  ) : null
})

AdminEventDetailsDeleteDocument.propTypes = propTypes

AdminEventDetailsDeleteDocument.defaultProps = {}

export default AdminEventDetailsDeleteDocument
