import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import { HeaderLogoSrcContext } from '../../../Contexts'
import { VARIANT } from '../../../utils/constants'

import Header from '../../Header'
import AdminField from './AdminField'
import { AdminButton } from '.'
import MobilePreview from '../../MobilePreview'

const propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(File),
    PropTypes.instanceOf(Parse.File),
  ]),
  event: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
}

const AdminHeaderLogoUploadField = ({ onChange, value, event, client }) => {
  const file = value?.url
    ? value.url
    : value !== null
    ? URL.createObjectURL(value)
    : ''
  return (
    <>
      <div className="admin-header-logo-upload-field">
        <div>
          <AdminField
            type="file"
            value={file}
            placeholder="Upload your own custom logo"
            onChange={onChange}
            allowedFileTypes={['png', 'jpg']}
          />
          {value?.name && (
            <AdminButton
              onClick={() => onChange(null)}
              hollow
              variant={VARIANT.NoBackground}
            >
              &times;
            </AdminButton>
          )}
        </div>
        <div className="admin-header-logo-upload-field__header-container">
          <HeaderLogoSrcContext.Provider value={file}>
            <Header event={event} client={client} />
          </HeaderLogoSrcContext.Provider>
        </div>
      </div>

      <MobilePreview logo={file} />
    </>
  )
}

AdminHeaderLogoUploadField.propTypes = propTypes

AdminHeaderLogoUploadField.defaultProps = {
  value: null,
}

export default AdminHeaderLogoUploadField
