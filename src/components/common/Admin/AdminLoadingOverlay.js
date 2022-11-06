import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Loading } from '..'

const propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
}

const AdminLoadingOverlay = ({ open, message }) => (
  <div
    className={`admin-loading-overlay ${
      open ? 'admin-loading-overlay--open' : ''
    }`}
  >
    <div>
      <Loading />
      <div>{message}</div>
    </div>
  </div>
)

AdminLoadingOverlay.propTypes = propTypes

AdminLoadingOverlay.defaultProps = {}

export default compose(
  connect(state => ({
    open: state.admin.isLoading,
    message: state.admin.loadingMessage,
  })),
)(AdminLoadingOverlay)
