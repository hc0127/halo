import React from 'react'
import PropTypes from 'prop-types'

import HaloChecksUploader from '../common/HaloCheckUploader'
import AdminButton from '../common/Admin/AdminButton'

const AdminEmptyPage = ({
  eventId,
  reloadHaloChecks,
  title,
  description,
  ctaText,
  ctaClicked,
  toggleHaloChecksLoadingModal,
}) => (
  <div className="admin-empty-page">
    {title ? <h3>{title}</h3> : null}

    {description ? <p>{description}</p> : null}

    {ctaText && ctaClicked ? (
      <>
        <AdminButton onClick={ctaClicked}>{ctaText}</AdminButton>
        <p style={{ marginTop: '5px', marginBottom: '5px' }}>or</p>
        <HaloChecksUploader
          eventId={eventId}
          reloadHaloChecks={reloadHaloChecks}
          position="center"
          toggleHaloChecksLoadingModal={toggleHaloChecksLoadingModal}
        />
      </>
    ) : null}
  </div>
)

AdminEmptyPage.propTypes = {
  eventId: PropTypes.string,
  reloadHaloChecks: PropTypes.func,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  ctaText: PropTypes.string,
  ctaClicked: PropTypes.func,
  toggleHaloChecksLoadingModal: PropTypes.func,
}

AdminEmptyPage.defaultProps = {
  eventId: '',
  reloadHaloChecks: () => {},
  ctaText: '',
  ctaClicked: '',
  toggleHaloChecksLoadingModal: () => {},
}

export default AdminEmptyPage
