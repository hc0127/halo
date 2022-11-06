import React, { Component } from 'react'
import PropTypes from 'prop-types'

import editImage from '../../../images/edit.svg'
import okImage from '../../../images/success.svg'
import closeImage from '../../../images/close.svg'

class EditableField extends Component {
  constructor(props) {
    super(props)
    this.state = { value: props.value, edit: false }
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.value !== this.props.value) {
      this.setState({ value: newProps.value })
    }
  }

  onValueChange(e) {
    let { value } = e.target

    value = value.replace(/\D/gim, '')

    value = value.slice(0, 6)

    value = +value || 0

    this.setState({ value })
  }

  onConfirm() {
    if (this.state.value !== this.props.value)
      this.props.onSubmit(this.state.value)
    this.setState({ edit: false })
  }

  onCancel() {
    this.setState({ edit: false, value: this.props.value })
  }

  render() {
    const { edit, value } = this.state

    return (
      <div className="EditableField">
        <div className="EditableField__ValueContainer">
          {edit && (
            <input
              className="EditableField__Edit"
              autoFocus /* eslint-disable-line */
              type="text"
              value={value}
              onChange={e => this.onValueChange(e)}
            />
          )}
          {!edit && <span className="EditableField__Value">{value}</span>}
        </div>
        <div className="EditableField__ImageContainer">
          {edit && (
            <img /* eslint-disable-line */
              src={closeImage}
              className="up"
              alt="cancel"
              onClick={() => this.onCancel()}
            />
          )}
          {edit && (
            <img /* eslint-disable-line */
              src={okImage}
              className="down"
              alt="confirm"
              onClick={() => this.onConfirm()}
            />
          )}
          {!edit && (
            <img /* eslint-disable-line */
              src={editImage}
              className="down"
              alt="edit venue capacity"
              onClick={() => this.setState({ edit: true })}
            />
          )}
        </div>
      </div>
    )
  }
}

EditableField.propTypes = {
  value: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default EditableField
