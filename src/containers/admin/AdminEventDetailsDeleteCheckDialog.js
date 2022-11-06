import React, { forwardRef, useImperativeHandle, useState } from 'react'
import PropTypes from 'prop-types'
import { AdminButton, AdminTitle } from '../../components/common/Admin'
import { VARIANT } from '../../utils/constants'

const propTypes = {
  onDone: PropTypes.func.isRequired,
}

const AdminEventDetailsDeleteCheckDialog = forwardRef(({ onDone }, ref) => {
  const [show, setShow] = useState(false)
  const [checks, setChecks] = useState([])

  useImperativeHandle(ref, () => ({
    show(checks) {
      setShow(true)
      setChecks(checks)
    },
  }))

  const title = checks.length === 1 ? 'Delete Check' : 'Delete Checks'
  const message =
    checks.length === 1
      ? 'Deleting a check cannot be undone, are you sure you want to delete this check?'
      : 'Deleting checks cannot be undone, are you sure you want to delete these checks?'

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
              onDone(checks)
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

AdminEventDetailsDeleteCheckDialog.propTypes = propTypes

AdminEventDetailsDeleteCheckDialog.defaultProps = {}

export default AdminEventDetailsDeleteCheckDialog
