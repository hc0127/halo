import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ButtonWithIcon from '../ButtonWithIcon'
import { BUTTON_ICONS, VARIANT } from '../../../utils/constants'

class AdminPasswordField extends Component {
  static propTypes = {
    placeholder: PropTypes.string,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    onEnter: PropTypes.func,
    disabled: PropTypes.bool,
    required: PropTypes.string,
    tabIndex: PropTypes.number,
  }

  static defaultProps = {
    placeholder: '',
    disabled: false,
    onEnter: () => {},
    onBlur: () => {},
    onFocus: () => {},
    required: null,
    tabIndex: null,
  }

  constructor(props) {
    super(props)
    this.state = { type: 'password' }
  }

  render() {
    const {
      placeholder,
      onBlur,
      onChange,
      onFocus,
      onEnter,
      tabIndex,
      disabled,
      required,
    } = this.props
    const { type } = this.state

    return (
      <div className="admin-field__password-container">
        <input
          className="admin-field__input"
          type={type}
          placeholder={placeholder}
          onChange={onChange}
          onKeyUp={({ key, target }) =>
            key === 'Enter' && target.value.trim() && onEnter()
          }
          onBlur={onBlur}
          onFocus={onFocus}
          tabIndex={tabIndex}
          disabled={disabled}
          required={required}
        />
        <ButtonWithIcon
          onClick={() => {
            this.setState({ type: type === 'password' ? 'text' : 'password' })
          }}
          icon={
            type === 'password'
              ? BUTTON_ICONS.ShowPassword
              : BUTTON_ICONS.HidePassword
          }
          variant={VARIANT.NoBackground}
        />
      </div>
    )
  }
}

export default AdminPasswordField
