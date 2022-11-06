import React from 'react'
import propTypes from 'prop-types'

import { Button } from '../common'

import { INCIDENT_FIELD_TYPES } from '../../utils/constants'
import IncidentFormFieldMap from './IncidentFormFieldMap'

const FieldPhoto = ({ handleChange, id }) => (
  <div>
    <input type="file" onChange={e => handleChange(id, e.target.files[0])} />
  </div>
)
FieldPhoto.propTypes = {
  id: propTypes.string.isRequired,
  handleChange: propTypes.func.isRequired,
}
FieldPhoto.defaultProps = {}

const FieldPicker = ({ placeholder, dataSource, handleChange, id, value, disabled }) => (
  <div>
    <select
      value={value}
      onChange={e => handleChange(id, e.target.value)}
      onBlur={e => handleChange(id, e.target.value)}
      disabled = {disabled}
    >
      {' '}
      <option value="">{placeholder || 'Select...'}</option>
      {dataSource.map(val => (
        <option key={val.value} value={val.value}>
          {val.text}
        </option>
      ))}
    </select>
  </div>
)
FieldPicker.propTypes = {
  placeholder: propTypes.string,
  dataSource: propTypes.arrayOf(
    propTypes.shape({ text: propTypes.string, value: propTypes.string }),
  ).isRequired,
  id: propTypes.string.isRequired,
  handleChange: propTypes.func.isRequired,
  value: propTypes.string,
}
FieldPicker.defaultProps = { placeholder: '', value: '' }

// TODO: keyboard type: number,phone, standard, validation stuff
const FieldInput = ({
  placeholder,
  handleChange,
  id,
  value,
  disabled,
  numberOnly,
}) => (
  <div>
    <input
      type={numberOnly ? 'number' : 'text'}
      placeholder={placeholder}
      value={value}
      onChange={e => handleChange(id, e.target.value)}
      disabled={disabled}
      style={{cursor: disabled && "default"}}
    />
  </div>
)
FieldInput.propTypes = {
  placeholder: propTypes.string,
  id: propTypes.string.isRequired,
  handleChange: propTypes.func.isRequired,
  value: propTypes.string,
  disabled: propTypes.bool,
  numberOnly: propTypes.bool,
}
FieldInput.defaultProps = {
  placeholder: '',
  value: '',
  disabled: false,
  numberOnly: false,
}

const FieldCollection = ({
  dataSource,
  renderChild,
  handleChange,
  id,
  value,
}) => (
  <div className="fieldCollection">
    {dataSource.map(val => renderChild(val, handleChange, id, value))}
  </div>
)
FieldCollection.propTypes = {
  dataSource: propTypes.arrayOf(
    propTypes.shape({ text: propTypes.string, value: propTypes.string }),
  ).isRequired,
  renderChild: propTypes.func.isRequired,
  id: propTypes.string.isRequired,
  handleChange: propTypes.func.isRequired,
  value: propTypes.string,
}
FieldCollection.defaultProps = { value: '' }

const FieldTextview = ({ placeholder, handleChange, id, value, disabled }) => (
  <div>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={e => handleChange(id, e.target.value)}
      disabled={disabled}
    />
  </div>
)
FieldTextview.propTypes = {
  placeholder: propTypes.string,
  id: propTypes.string.isRequired,
  handleChange: propTypes.func.isRequired,
  value: propTypes.string,
}
FieldTextview.defaultProps = { placeholder: '', value: '' }

const IncidentFormField = ({
  id,
  field_type,
  title,
  placeholder,
  dataSource,
  value_type,
  keyboard_type,
  handleChange,
  value,
  event,
  disabled,
  numberOnly,
}) => {
  let node
  switch (field_type) {
    case INCIDENT_FIELD_TYPES.photo:
      node = <FieldPhoto {...{ handleChange, value, id }} />
      break
    case INCIDENT_FIELD_TYPES.modal:
      node = <FieldPicker {...{ dataSource, handleChange, value, id, disabled }} />
      break
    case INCIDENT_FIELD_TYPES.map:
      node = (
        <IncidentFormFieldMap
          {...{ dataSource, placeholder, handleChange, value, id, event }}
        />
      )
      break
    case INCIDENT_FIELD_TYPES.field:
    case INCIDENT_FIELD_TYPES.numberfield:
      node = (
        <FieldInput
          {...{
            placeholder,
            keyboard_type,
            handleChange,
            value,
            id,
            disabled,
            numberOnly,
          }}
        />
      )
      break
    case INCIDENT_FIELD_TYPES.picker:
    case INCIDENT_FIELD_TYPES.table:
      node = (
        <FieldPicker
          {...{ placeholder, dataSource, handleChange, value, id, disabled }}
        />
      )
      break
    case INCIDENT_FIELD_TYPES.collection:
      node = (
        <FieldCollection
          {...{ value_type, dataSource, handleChange, value, id, disabled }}
          renderChild={(
            { text, value: val },
            localHandleChange,
            localId,
            selectedValue,
          ) => (
            <Button
              type="invisible"
              key={val}
              onClick={() => localHandleChange(localId, text)}
            >
              <div
                className={`colorBlock ${
                  val === selectedValue ? 'colorBlock--selected' : ''
                }`}
                style={{
                  backgroundColor: `#${val}`,
                }}
              >
                {text}
              </div>
            </Button>
          )}
        />
      )
      break
    case INCIDENT_FIELD_TYPES.textview:
      node = <FieldTextview {...{ placeholder, handleChange, value, id, disabled }} />
      break
    case INCIDENT_FIELD_TYPES.review:
    default:
      return null
  }
  // test
  return (
    <div className="IncidentFormField">
      <span className="IncidentFormField__label">{title}</span>
      {node}
    </div>
  )
}

IncidentFormField.propTypes = {
  type: propTypes.string,
  id: propTypes.string,
  title: propTypes.string,
  mandatory: propTypes.bool,
  valueType: propTypes.string,
  placeholder: propTypes.string,
  keyboardType: propTypes.string,
  validation: propTypes.string,
  value: propTypes.any,
  handleChange: propTypes.func,
  event: propTypes.object,
  dataSource: propTypes.array,
  field_type: propTypes.string,
  value_type: propTypes.string,
  keyboard_type: propTypes.string,
  disabled: propTypes.bool,
  numberOnly: propTypes.bool,
}
IncidentFormField.defaultProps = {
  type: 'UNKNOWN TYPE',
  id: 'UNKNOWN ID',
  title: '',
  field_type: '',
  value_type: '',
  keyboard_type: '',
  mandatory: false,
  valueType: 'UNKNOWN VALUETYPE',
  placeholder: '',
  keyboardType: '',
  validation: '',
  value: undefined,
  handleChange: (/* id, value */) => {},
  event: null,
  dataSource: [],
  disabled: false,
  numberOnly: false,
}

export default IncidentFormField
