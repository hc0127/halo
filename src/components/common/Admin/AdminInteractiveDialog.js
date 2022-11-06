import React, { forwardRef, useImperativeHandle, useState } from 'react'
import PropTypes from 'prop-types'

const AdminInteractiveDialog = forwardRef(({ children }, ref) => {
  const [show, setShow] = useState(false)

  useImperativeHandle(ref, () => ({
    show: () => setShow(true),
    hide: () => setShow(false),
  }))

  if (!show) {
    return null
  }

  return (
    <>
      <div className="admin-dialog admin-dialog--open">{children}</div>
      <button
        className="admin-dialog-overlay admin-dialog-overlay--open"
        onClick={() => setShow(false)}
      />
    </>
  )
})

AdminInteractiveDialog.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AdminInteractiveDialog
