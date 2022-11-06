import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Datepicker from 'react-datepicker'
import moment from 'moment'
import Parse from 'parse'
import Select from 'react-select'
import 'moment/locale/en-gb'

import { AdminPasswordField, AdminSwitch } from '.'
import { VARIANT, BUTTON_ICONS } from '../../../utils/constants'
import utils from '../../../utils/helpers'
import AdminFieldFile from './AdminFieldFile'
import Icon from '../Icon'

class AdminField extends Component {
  static propTypes = {
    label: PropTypes.string,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
      PropTypes.number,
      PropTypes.instanceOf(moment),
      PropTypes.instanceOf(File),
      PropTypes.instanceOf(Parse.File),
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
          .isRequired,
      }),
    ]),
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    onEnter: PropTypes.func,
    disabled: PropTypes.bool,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
          .isRequired,
      }),
    ),
    variant: PropTypes.oneOf(Object.values(VARIANT)),
    required: PropTypes.string,
    tabIndex: PropTypes.number,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    hasChanged: PropTypes.bool,
    checked: PropTypes.bool,
    checkboxLabel: PropTypes.string,
  }

  static defaultProps = {
    placeholder: '',
    label: '',
    disabled: false,
    onEnter: () => {},
    value: null,
    onBlur: () => {},
    onFocus: () => {},
    options: [],
    variant: VARIANT.Primary,
    required: null,
    tabIndex: null,
    error: null,
    tooltip: null,
    hasChanged: false,
    checked: false,
    checkboxLabel: '',
  }

  constructor(props) {
    super(props)
    this.state = { hasChanged: false, error: '' }
  }

  getErrors() {
    const {
      value,
      required,
      hasChanged: hasChangedFromProps,
      error: errorFromProps,
    } = this.props

    const {
      hasChanged: hasChangedFromState,
      error: errorFromState,
    } = this.state

    if (hasChangedFromState) {
      if (errorFromState) {
        return errorFromState
      }
      if (!value) {
        return required
      }

      if (value.trim && !value.trim()) {
        return required
      }

      if (errorFromProps) {
        return errorFromProps
      }
    }

    if (hasChangedFromProps && errorFromState) {
      return errorFromState
    }

    return ''
  }

  render() {
    const {
      label,
      type,
      placeholder,
      value,
      onBlur,
      onChange,
      onFocus,
      onEnter,
      disabled,
      options,
      variant,
      tooltip,
      tabIndex,
      checked,
      checkboxLabel,
      ...otherProps
    } = this.props

    const onInputChange = val => {
      onChange(val)
      this.setState({ hasChanged: true })
    }

    const onInputBlur = () => {
      this.setState({ hasChanged: true })
      onBlur()
    }

    let input = null
    switch (type) {
      case 'switch':
        return (
          <AdminSwitch
            {...{ label, placeholder, value, onChange, disabled, variant }}
          />
        )
      case 'textarea':
        input = (
          <textarea
            className="admin-field__input"
            placeholder={placeholder}
            onChange={e => onInputChange(e.target.value)}
            value={value}
            onBlur={onInputBlur}
            onFocus={onFocus}
            tabIndex={tabIndex}
          />
        )
        break
      case 'number':
        input = (
          <input
            className="admin-field__input"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={e => onInputChange(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={onInputBlur}
            onFocus={onFocus}
            onKeyUp={({ key, target }) =>
              key === 'Enter' && target.value && onEnter()
            }
            tabIndex={tabIndex}
            {...otherProps}
          />
        )
        break
      case 'file':
        input = (
          <AdminFieldFile
            value={value}
            placeholder={placeholder}
            onChange={file => {
              this.setState({ error: '' })
              onInputChange(file)
            }}
            onBlur={onInputBlur}
            onFocus={onFocus}
            tabIndex={tabIndex}
            {...otherProps}
            onError={message => {
              this.setState({ error: message })
              onInputChange(null)
            }}
          />
        )
        break
      case 'date':
        input = (
          <div className="admin-field__date-container">
            <label>
              {/* eslint-disable-line */}
              <Datepicker
                className="admin-field__input"
                selected={value}
                onChange={newValue => onInputChange(newValue)}
                locale="en-GB"
                dateFormat="LL"
                placeholderText={placeholder}
                onBlur={onInputBlur}
                onFocus={onFocus}
                tabIndex={tabIndex}
              />
              <Icon icon={BUTTON_ICONS.Calendar} />
            </label>
          </div>
        )
        break
      case 'datetime':
        input = (
          <div className="admin-field__date-container">
            <label>
              {/* eslint-disable-line */}
              <Datepicker
                className="admin-field__input"
                selected={value}
                onChange={newValue => onInputChange(newValue)}
                showTimeSelect
                minDate={moment().toDate()}
                timeIntervals={15}
                timeFormat="HH:mm"
                timeCaption="Time"
                locale="en-GB"
                dateFormat="LLL"
                placeholderText={placeholder}
                onBlur={onInputBlur}
                onFocus={onFocus}
                tabIndex={tabIndex}
              />
              <Icon icon={BUTTON_ICONS.Calendar} />
            </label>
          </div>
        )
        break
      case 'time':
        {
          const optionCount = 24 * 4
          const times = new Array(optionCount)
            .join(',')
            .split(',')
            .map((_, ind) => {
              const time = ind * 15
              const minutes = time % 60
              const hours = Math.floor(time / 60)

              return (
                (hours < 10 ? '0' + hours : hours.toString()) +
                ':' +
                (minutes < 10 ? '0' + minutes : minutes.toString())
              )
            })

          input = (
            <div className="admin-field__select-container">
              <select
                className="admin-field__input"
                value={value}
                onChange={e => onInputChange(e.target.value)}
                onBlur={onInputBlur}
                onFocus={onFocus}
                disabled={disabled}
                tabIndex={tabIndex}
              >
                {placeholder && <option value="">{placeholder}</option>}
                {times.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )
        }
        break
      case 'dropdown':
        input = (
          <div className="admin-field__select-container">
            <select
              className="admin-field__input"
              value={value}
              onChange={e => onInputChange(e.target.value)}
              onBlur={onInputBlur}
              onFocus={onFocus}
              disabled={disabled}
              tabIndex={tabIndex}
            >
              {placeholder && <option value="">{placeholder}</option>}
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )
        break
      case 'react-select':
        input = (
          <Select
            className="admin-field__select"
            classNamePrefix="admin-field__select"
            value={value}
            onChange={option => onInputChange(option.value)}
            onBlur={onInputBlur}
            onFocus={onFocus}
            disabled={disabled}
            options={options}
            placeholder={placeholder}
            {...otherProps}
          />
        )
        break
      case 'password':
        input = (
          <AdminPasswordField
            onChange={e => {
              onInputChange(e.target.value)
            }}
            onBlur={onInputBlur}
            onFocus={onFocus}
            disabled={disabled}
            placeholder={placeholder}
            tabIndex={tabIndex}
            {...otherProps}
          />
        )
        break
      case 'checkbox':
        input = (
          <div className="admin-field__checkbox-container">
            <label htmlFor="checkbox">{checkboxLabel}</label>
            <input
              id="checkbox"
              type="checkbox"
              disabled={disabled}
              checked={checked}
              onChange={onChange}
            />
          </div>
        )
        break
      default:
        input = (
          <input
            className="admin-field__input"
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onInputChange(e.target.value)}
            onKeyUp={({ key, target }) =>
              key === 'Enter' && target.value.trim() && onEnter()
            }
            onBlur={onInputBlur}
            onFocus={onFocus}
            tabIndex={tabIndex}
          />
        )
        break
    }

    const allErrors = this.getErrors()

    let internalToolTip = ''
    if (type === 'file') {
      internalToolTip = AdminFieldFile.generateTooltip(otherProps)
    }
    const allTooltips = tooltip || (!allErrors && internalToolTip)

    return (
      <div
        className={utils.makeClass(
          'admin-field',
          type,
          allErrors && 'has-error',
          allTooltips && 'has-tooltip',
        )}
      >
        {label && <label>{label}</label>}
        {input}
        {!allTooltips && <div className="admin-field__error">{allErrors}</div>}
        {allTooltips && (
          <div className="admin-field__tooltip">{allTooltips}</div>
        )}
      </div>
    )
  }
}

export default AdminField
