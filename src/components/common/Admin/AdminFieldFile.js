import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import { BUTTON_ICONS, VARIANT } from '../../../utils/constants'
import Icon from '../Icon'
import { AdminButton } from '.'

const propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(Parse.File),
    PropTypes.instanceOf(File),
  ]),
  placeholder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  tabIndex: PropTypes.number,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  onError: PropTypes.func.isRequired,
  maxWidth: PropTypes.number,
  maxHeight: PropTypes.number,
  maxSize: PropTypes.number,
  canRemove: PropTypes.bool,
}

const formatSize = size => {
  const kb = 1024
  const mb = kb ** 2

  if (size / mb === parseInt(size / mb, 10)) {
    return `${size / mb}MB`
  }
  if (size / kb === parseInt(size / kb, 10)) {
    return `${size / kb}KB`
  }

  return `${size}B`
}

const onFileChange = (
  onChange,
  onError,
  allowedFileTypes,
  maxWidth,
  maxHeight,
  maxSize,
) => e => {
  e.preventDefault()

  const file = e.currentTarget.files[0]

  if (!file) {
    return
  }

  if (maxSize) {
    if (file.size >= maxSize) {
      onError(`Selected file is over ${formatSize(maxSize)}`)
      return
    }
  }

  const extension = file.name.split('.').pop()
  if (!allowedFileTypes.includes(extension)) {
    onError(
      `Selected file isn't ${
        allowedFileTypes.length === 1 ? 'a' : 'one of the following types:'
      } ${allowedFileTypes.map(val => val.toUpperCase()).join(', ')}`,
    )
    return
  }

  if (!maxWidth || !maxHeight) {
    onChange(file)
    return
  }

  const img = new Image()
  img.onload = () => {
    if (img.width >= maxWidth || img.height >= maxHeight) {
      onChange(null)
      onError(`Selected file is over ${maxWidth}px*${maxHeight}px`)
    } else {
      onChange(file)
    }
  }
  img.src = URL.createObjectURL(file)
}

const AdminFieldFile = ({
  value,
  placeholder,
  onChange,
  onBlur,
  onFocus,
  tabIndex,
  allowedFileTypes,
  onError,
  maxWidth,
  maxHeight,
  maxSize,
  canRemove,
}) => (
  <label className="admin-field__file-container">
    <span className="admin-field__selected-file">
      {value ? value.name : placeholder || 'Upload file'}
    </span>
    <input
      className="admin-field__input"
      type="file"
      placeholder={placeholder}
      onChange={onFileChange(
        onChange,
        onError,
        allowedFileTypes,
        maxWidth,
        maxHeight,
        maxSize,
      )}
      onBlur={onBlur}
      onFocus={onFocus}
      tabIndex={tabIndex}
      accept={allowedFileTypes.map(fileType => `.${fileType}`).join(',')}
    />
    {canRemove && value && (
      <AdminButton
        onClick={e => {
          onChange(null)
          e.preventDefault()
        }}
        hollow
        variant={VARIANT.NoBackground}
      >
        &times;
      </AdminButton>
    )}
    <Icon icon={BUTTON_ICONS.Upload} />
  </label>
)

AdminFieldFile.propTypes = propTypes

AdminFieldFile.defaultProps = {
  value: null,
  tabIndex: null,
  maxWidth: 0,
  maxHeight: 0,
  maxSize: 0,
  canRemove: false,
}

AdminFieldFile.generateTooltip = ({
  allowedFileTypes,
  maxWidth,
  maxHeight,
  maxSize,
}) => {
  if (allowedFileTypes.length === 1 && allowedFileTypes[0] === 'pdf') {
    return `Upload a PDF${maxSize ? ` up to ${formatSize(maxSize)}` : ``}`
  }

  if (allowedFileTypes.length && allowedFileTypes[0] === 'csv') {
    return `Upload a csv`
  }

  return `Upload a picture (${allowedFileTypes
    .map(fileType => fileType.toUpperCase())
    .join(',')})${
    maxWidth && maxHeight ? ` up to ${maxWidth}px*${maxHeight}px` : ''
  }`
}

export default AdminFieldFile
