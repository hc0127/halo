import React from 'react'
import PropTypes from 'prop-types'

import ErrorsContent from '../../common/ErrorsContent'
import TextInputItem from '../../common/TextInputItem'
import TextAreaItem from '../../common/TextareaItem'
import SelectIInputItem from '../../common/SelectInputItem'

import useDialogCustomerSupport from './useDialogCustomerSupport'

import UploadIcon from '../../../images/upload_icon.png'
import CheckCircleIcon from './../../../images/check_circle.png'
import HashIcon from './../../../images/hash.png'
import CloseIcon from './../../../images/iconX.png'

const TARGET_CUSTOMER_OPTIONS = [
  {
    label: <div className="dialog-select-value">Me</div>,
    value: 'me',
  },
  {
    label: <div className="dialog-select-value">Someone else</div>,
    value: 'someone_else',
  },
]

const PRIORITY_OPTIONS = [
  {
    label: <div className="dialog-select-value">Urgent</div>,
    value: '1',
  },
  {
    label: <div className="dialog-select-value">High</div>,
    value: '2',
  },
  {
    label: <div className="dialog-select-value">Normal</div>,
    value: '3',
  },
  {
    label: <div className="dialog-select-value">Low</div>,
    value: '4',
  },
]

const DialogCustomerSupport = ({ open, onClose, onKeyDown }) => {
  const {
    restMembers,
    assigneeType,
    selectedSomeoneElse,
    selectedPriority,
    loading,
    success,
    checkboxFields,
    createTaskSuccess,
    handleSelectAssignee,
    handleSelectSomeoneElse,
    handleSelectPriority,
    formikErrors,
    formikHandleSubmit,
    formikHandleBlur,
    formikHandleChange,
    formikValues,
    handleSelectCustomFields,
    handleUploadChange,
    handleCloseSuccessDialog,
  } = useDialogCustomerSupport({ onKeyDown })

  if (loading) {
    return <h1 className="dialog-customer-support-container">LOADING...</h1>
  }

  return open ? (
    <div
      className="dialog-customer-support-backdrop"
      onClick={onClose}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      id="backdrop"
    >
      {!loading && success && createTaskSuccess ? (
        <div>
          <div className="dialog-success-submit-container">
            <div
              style={{
                width: '100%',
                position: 'relative',
              }}
              className="dialog-success-submit-container-header"
            >
              <div onClick={handleCloseSuccessDialog}>
                <img src={CloseIcon} alt="Close" />
              </div>
            </div>
            <div className="dialog-success-submit-container-check-circle">
              <img src={CheckCircleIcon} alt="Check circle" />
            </div>
            <div className="dialog-success-submit-container-main-text">
              Your request was submited <b>successfully</b>
            </div>
            <div className="dialog-success-submit-container-id-content">
              <span>#</span>
              <span>CS 0000159</span>
            </div>
            <div className="dialog-success-submit-container-second-text">
              If you need to contact us urgently, you can call to this numer:
            </div>
            <div className="dialog-success-submit-container-hash-content">
              <img src={HashIcon} alt="Hash" />
              <span>004234562879</span>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && success && !createTaskSuccess ? (
        <div className="dialog-customer-support-container">
          <form onSubmit={formikHandleSubmit}>
            <div>Customer Request</div>
            <TextInputItem
              name="name"
              label="Name"
              onChange={formikHandleChange}
              onBlur={formikHandleBlur}
              value={formikValues.name}
            />
            <ErrorsContent content={formikErrors.name} />
            <TextInputItem
              name="email"
              label="Email"
              type="email"
              onChange={formikHandleChange}
              onBlur={formikHandleBlur}
              value={formikValues.email}
            />
            <ErrorsContent content={formikErrors.email} />
            <SelectIInputItem
              options={TARGET_CUSTOMER_OPTIONS}
              placeholder="Is this support request for you or someone else?"
              onChange={handleSelectAssignee}
              value={assigneeType}
              name="assignees"
            />
            {!selectedSomeoneElse.value ? (
              <ErrorsContent content={formikErrors.assignees} />
            ) : null}
            {assigneeType.value === 'someone_else' ? (
              <SelectIInputItem
                options={restMembers}
                placeholder="Which user are you creating the request on behalf of"
                onChange={handleSelectSomeoneElse}
                value={selectedSomeoneElse}
              />
            ) : null}
            <SelectIInputItem
              options={PRIORITY_OPTIONS}
              placeholder="Request priority"
              onChange={handleSelectPriority}
              value={selectedPriority.value}
            />
            <ErrorsContent content={formikErrors.priority} />
            <div className="dialog-checkbox-container">
              <div>Product</div>
              <div>
                {checkboxFields.map(field => (
                  <div key={field.id}>
                    <input
                      id={field.id}
                      checked={field.value}
                      type={'checkbox'}
                      onChange={handleSelectCustomFields(field)}
                    />
                    <label htmlFor={field.id}>{field.label}</label>
                  </div>
                ))}
              </div>
            </div>
            <TextInputItem
              name="summary"
              label="Summary"
              value={formikValues.summary}
              onChange={formikHandleChange}
            />
            <ErrorsContent content={formikErrors.summary} />
            <TextAreaItem
              label="Request details"
              containerStyles={{ height: 100 }}
              name="description"
              onChange={formikHandleChange}
            />
            <ErrorsContent content={formikErrors.description} />
            <div className="dialog-upload-container">
              <p>Upload photo</p>
              <input
                id="input_file"
                type="file"
                onChange={handleUploadChange}
              />
              <div
                className="dialog-upload-container-icon-block"
                onClick={() => document.getElementById('input_file').click()}
              >
                <img src={UploadIcon} alt="Upload" />
              </div>
              <p>
                Please ask the informant if they have a recent protograph ,
                maybe on their phone
              </p>
            </div>
            <div style={{ marginTop: 25 }}>
              <button
                style={{
                  width: 110,
                  height: 35,
                  float: 'right',
                  background: '#20315F',
                  borderRadius: 18,
                  color: 'white',
                  border: 0,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
                disabled={Object.values(formikErrors).length}
                type="submit"
              >
                SAVE
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  ) : null
}

DialogCustomerSupport.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onKeyDown: PropTypes.func,
}

DialogCustomerSupport.defaultProps = {
  open: false,
  onClose: () => {},
  onKeyDown: () => {},
}

export default DialogCustomerSupport
