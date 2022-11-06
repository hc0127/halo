import React from 'react'
import PropTypes from 'prop-types'
import ClickableDiv from '../../ClickableDiv'

const Checkbox = ({ label, handleCheckbox = () => {}, ...rest }) => {
  return (
    <ClickableDiv onClick={handleCheckbox} className="Checkbox">
      {label ? <label>{label}</label> : null}
      <input type="checkbox" id="checkLogged" {...rest} />
    </ClickableDiv>
  )
}

Checkbox.propTypes = {
  label: PropTypes.string,
  handleCheckbox: PropTypes.func.isRequired,
}

Checkbox.defaultProps = {
  label: '',
}

export default Checkbox
