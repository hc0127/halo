import React, { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useFileInputDataValue } from '../../../../utils/customHooks'

const propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultFile: PropTypes.any,
}

const AdminDialogAddOrModifyHaloCheckUpload = ({ onChange, defaultFile }) => {
  const [file, setFile] = useState(defaultFile)
  const [isInvalidFileType, setIsInvalidFileType] = useState(false)
  const inputRef = useRef()
  const dataUri = useFileInputDataValue(file)

  const onBoxClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [inputRef])

  const onFileInputChange = useCallback(
    e => {
      const inputFile = e.target.files[0]
      if (!inputFile) {
        setFile(null)
        return
      }

      if (!inputFile.type || !inputFile.type.startsWith('image/')) {
        setIsInvalidFileType(true)
        return
      }

      setFile(inputFile)

      if (inputRef.current) {
        inputRef.current.value = null
      }
    },
    [setFile, inputRef],
  )

  const onResultClick = useCallback(() => {
    setFile(null)
  }, [setFile])

  useEffect(() => {
    setIsInvalidFileType(false)

    if (file !== defaultFile) {
      onChange(file)
    }
  }, [file, defaultFile, onChange, setIsInvalidFileType])

  return (
    <div className="check-upload">
      {file ? (
        <img /*eslint-disable-line*/
          className="check-upload-result"
          src={dataUri || file.url || ''}
          onClick={onResultClick}
        />
      ) : (
        <>
          <input
            type="file"
            style={{ display: 'none' }}
            ref={inputRef}
            onChange={onFileInputChange}
          />
          <div className="check-upload-box" onClick={onBoxClick}> {/*eslint-disable-line*/}
            + Add an image
          </div>
        </>
      )}

      {isInvalidFileType ? (
        <div className="admin-field__error">
          Invalid file type. Only images are allowed.
        </div>
      ) : null}
    </div>
  )
}

AdminDialogAddOrModifyHaloCheckUpload.propTypes = propTypes

AdminDialogAddOrModifyHaloCheckUpload.defaultProps = {
  defaultFile: null,
}

export default AdminDialogAddOrModifyHaloCheckUpload
