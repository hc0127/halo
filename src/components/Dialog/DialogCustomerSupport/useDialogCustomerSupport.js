import React, { useState, useEffect } from 'react'
import { getCurrentUser } from './../../../utils/helpers'
import { useFormik } from 'formik'
import { CustomerSupportSchema } from './../../../containers/form/utils'

const CLICKUP_API_ACCESS_TOKEN = 'pk_44402817_0BS7B8UF2RDR7Y1EPV83CLAP27UAGN13'

const HEADERS = {
  Authorization: CLICKUP_API_ACCESS_TOKEN,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  Accept: '*/*',
  'Content-Type': 'application/json',
}

const useDialogCustomerSupport = ({ onKeyDown }) => {
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

  const {
    errors: formikErrors,
    handleSubmit: formikHandleSubmit,
    handleBlur: formikHandleBlur,
    handleChange: formikHandleChange,
    values: formikValues,
    setFieldValue: formikSetFieldValue,
    resetForm,
  } = useFormik({
    initialValues: {
      name: '',
      description: '',
      email: '',
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

      const query = new URLSearchParams({
        custom_task_ids: 'true',
        team_id: teamId,
      }).toString()

      const listId = '200543887'
      const createTaskResponse = await fetch(
        `https://api.clickup.com/api/v2/list/${listId}/task?${query}`,
        {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify({
            name: submitValues.name,
            description: submitValues.description,
            assignees: submitValues.assignees,
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
        const myHeaders = new Headers()
        myHeaders.append('Authorization', CLICKUP_API_ACCESS_TOKEN)

        const requestOptions = {
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

      resetForm()

      setCreateTaskSuccess(true)
    },
  })

  const getTeam = async () => {
    try {
      setLoading(true)

      const resp = await fetch(`https://api.clickup.com/api/v2/team`, {
        method: 'GET',
        headers: HEADERS,
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
          headers: HEADERS,
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
    } catch (err) {
      return err.message
    }
  }

  const handleSelectAssignee = e => {
    const { value } = e
    if (value === 'me') {
      formikSetFieldValue('assignees', `${me.user.id}`)
    } else {
      formikSetFieldValue('assignees', 'someone_else')
    }

    setAssigneeType(e)
  }

  const handleSelectSomeoneElse = e => {
    setSelectedSomeoneElse(e)

    formikSetFieldValue('assignees', `${e.value}`)
  }

  const handleSelectPriority = e => {
    setSelectedPriority(e)
    formikSetFieldValue('priority', e.value)
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

  const handleUploadChange = async e => {
    const file = e.target.files[0]

    const formdata = new FormData()

    formdata.append('attachment', file, file.name)

    setUploadedFormdata(formdata)
  }

  const handleCloseSuccessDialog = () => {
    setCreateTaskSuccess(false)
  }

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)

    getTeam()
    getCustomFields()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return {
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
  }
}

export default useDialogCustomerSupport
