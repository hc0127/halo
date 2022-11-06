import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
// import Select, { components } from 'react-select'
import { useFormik } from 'formik'

import ErrorsContent from '../common/ErrorsContent'
import TextInputItem from '../common/TextInputItem'
import TextAreaItem from '../common/TextareaItem'
import SelectIInputItem from '../common/SelectInputItem'

import { CustomerSupportSchema } from '../../containers/form/utils'
import { getCurrentUser } from '../../utils/helpers'

import UploadIcon from '../../images/upload_icon.png'
import CheckCircleIcon from './../../images/check_circle.png'
import HashIcon from './../../images/hash.png'
import CloseIcon from './../../images/iconX.png'

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
  const [teamId, setTeamId] = useState(null)
  const [me, setMe] = useState(null)
  const [restMembers, setRestMembers] = useState([])
  const [assigneeType, setAssigneeType] = useState({
    label: <div className="dialog-select-value">Me</div>,
    value: 'me',
  })
  const [selectedSomeoneElse, setSelectedSomeoneElse] = useState({
    label: <div className="dialog-select-value"></div>,
    value: '',
  })
  const [selectedPriority, setSelectedPriority] = useState({
    label: <div className="dialog-select-value"></div>,
    value: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [checkboxFields, setCheckboxFields] = useState([])
  const [emailField, setEmailField] = useState(null)
  const [summaryField, setSummaryField] = useState()
  const [uploadedFormData, setUploadedFormdata] = useState(null)
  const [createTaskSuccess, setCreateTaskSuccess] = useState(false)

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      email: 'email@gmail.com',
      assignees: '',
      priority: '',
      summary: '',
    },
    validationSchema: CustomerSupportSchema,
    onSubmit: async values => {
      const submitValues = {
        name: values.name,
        description: values.description,
        assignees: [values.assignees],
        check_required_custom_fields: true,
        custom_fields: [
          ...checkboxFields,
          { id: emailField.id, value: values.email },
          { id: summaryField.id, value: values.summary },
        ],
        priority: parseInt(values.priority),
      }

      console.log('FORMIK', formik)
      console.log('FORMIK VALUES', values)
      console.log('SUBMIT VALUES', submitValues)

      const query = new URLSearchParams({
        custom_task_ids: 'true',
        team_id: '20600984',
      }).toString()

      const listId = '200543887'
      const createTaskResponse = await fetch(
        `https://api.clickup.com/api/v2/list/${listId}/task?${query}`,
        {
          method: 'POST',
          headers: {
            Authorization: 'pk_44402817_0BS7B8UF2RDR7Y1EPV83CLAP27UAGN13',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            Accept: '*/*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: submitValues.name,
            description: submitValues.description,
            assignees: submitValues.assignees,
            attachments: ['1ad6cb20-0822-43e2-864a-b6d686fc160f.txt'],
            tags: ['tag name 1'],
            status: 'OPEN',
            priority: submitValues.priority,
            due_date: 1508369194377,
            due_date_time: false,
            time_estimate: 8640000,
            start_date: 1567780450202,
            start_date_time: false,
            notify_all: true,
            parent: null,
            links_to: null,
            check_required_custom_fields: true,
            custom_fields: submitValues.custom_fields,
          }),
        },
      )

      const createdTask = await createTaskResponse.json()
      console.log(createdTask)

      if (createdTask && uploadedFormData) {
        var myHeaders = new Headers()
        myHeaders.append(
          'Authorization',
          'pk_44402817_0BS7B8UF2RDR7Y1EPV83CLAP27UAGN13',
        )

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: uploadedFormData,
          redirect: 'follow',
        }

        await fetch(
          `https://api.clickup.com/api/v2/task/${createdTask.id}/attachment?custom_task_ids=true&team_id=${teamId}`,
          requestOptions,
        )
      }
    },
  })

  const getTeam = async () => {
    try {
      setLoading(true)

      const resp = await fetch(`https://api.clickup.com/api/v2/team`, {
        method: 'GET',
        headers: {
          Authorization: 'pk_44402817_0BS7B8UF2RDR7Y1EPV83CLAP27UAGN13',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
      })

      const { id, members } = (await resp.json()).teams[0]

      let me = null,
        restMembers = null

      restMembers = members
        .filter(member => {
          const {
            email: currentUserEmail,
            username: currentUsername,
            name: currentUserName,
          } = getCurrentUser()

          const { email, username } = member.user

          if (
            email.toLowerCase().includes(currentUserEmail.toLowerCase()) ||
            username.toLowerCase().includes(currentUsername.toLowerCase()) ||
            username.toLowerCase().includes(currentUserName.toLowerCase())
          ) {
            me = member
            return false
          } else {
            return true
          }
        })
        .map(member => ({
          label: (
            <div className="dialog-select-value">{member.user.username}</div>
          ),
          value: `${member.user.id}`,
        }))

      setTeamId(id)
      setMe(me)
      setRestMembers(restMembers)

      setLoading(false)
      setSuccess(true)
    } catch (err) {
      setLoading(false)

      return err.message
    }
  }

  const getCustomFields = async () => {
    try {
      const resp = await fetch(
        `https://api.clickup.com/api/v2/list/200543887/field`,
        {
          method: 'GET',
          headers: {
            Authorization: 'pk_44402817_0BS7B8UF2RDR7Y1EPV83CLAP27UAGN13',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            Accept: '*/*',
            'Content-Type': 'application/json',
          },
        },
      )

      const customFieldsData = (await resp.json()).fields

      const checkboxFields = customFieldsData
        .filter(field => {
          if (field.type === 'checkbox') {
            return true
          } else if (field.type === 'email') {
            setEmailField(field)
            return false
          } else if (field.name === 'Summary') {
            setSummaryField(field)

            return false
          }

          return false
        })
        .map(field => ({
          id: field.id,
          label: field.name,
          value: false,
        }))

      setCheckboxFields(checkboxFields)

      console.log('GET CUSOTM FILEDS', customFieldsData)
      console.log('checkboxFields', checkboxFields)
    } catch (err) {
      return err.message
    }
  }

  const handleSelectAssignee = e => {
    const { value } = e
    if (value === 'me') {
      formik.setFieldValue('assignees', `${me.user.id}`)
    } else {
      formik.setFieldValue('assignees', 'someone_else')
    }

    setAssigneeType(e)
  }

  const handleSelectSomeoneElse = e => {
    setSelectedSomeoneElse(e)

    formik.setFieldValue('assignees', `${e.value}`)
  }

  const handleSelectPriority = e => {
    setSelectedPriority(e)
    formik.setFieldValue('priority', e.value)
  }

  const handleSelectCustomFields = field => e => {
    const { checked } = e.target

    setCheckboxFields(
      [...checkboxFields].map(customField => ({
        ...customField,
        value: customField.id === field.id ? checked : customField.value,
      })),
    )
  }

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)

    getTeam()
    getCustomFields()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

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
              <div
                onClick={() => {
                  setCreateTaskSuccess(false)
                }}
              >
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
          <form onSubmit={formik.handleSubmit}>
            <div>Customer Request</div>
            <TextInputItem
              name="name"
              label="Name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            <ErrorsContent content={formik.errors.name} />
            <TextInputItem
              name="email"
              label="Email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            <ErrorsContent content={formik.errors.email} />
            <SelectIInputItem
              options={TARGET_CUSTOMER_OPTIONS}
              placeholder="Is this support request for you or someone else?"
              onChange={handleSelectAssignee}
              value={assigneeType}
              name="assignees"
            />
            {!selectedSomeoneElse.value ? (
              <ErrorsContent content={formik.errors.assignees} />
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
            <ErrorsContent content={formik.errors.priority} />
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
              value={formik.values.summary}
              onChange={formik.handleChange}
            />
            <ErrorsContent content={formik.errors.summary} />
            <TextAreaItem
              label="Request details"
              containerStyles={{ height: 100 }}
              name="description"
              onChange={formik.handleChange}
            />
            <ErrorsContent content={formik.errors.description} />
            <div className="dialog-upload-container">
              <p>Upload photo</p>
              <input
                id="input_file"
                type="file"
                onChange={async e => {
                  const file = e.target.files[0]

                  const formdata = new FormData()

                  formdata.append('attachment', file, file.name)

                  setUploadedFormdata(formdata)
                }}
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
                disabled={Object.values(formik.errors).length}
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
