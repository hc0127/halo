import React from 'react'
import PropTypes from 'prop-types'

import Select, { components } from 'react-select'

const styles = {
  valueContainer: base => ({
    ...base,
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isFocused || isSelected ? '#5F9DF7' : 'white',
      cursor: isDisabled ? 'not-allowed' : 'default',
      color: isFocused || isSelected ? 'white' : 'black',
      boxShadow:
        '0px 1px 2px rgba(0, 0, 0, 0.3), 1px 2px 2px rgba(0, 0, 0, 0.15)',
    }
  },
}

const ValueContainer = ({ children, ...props }) => {
  return (
    components.ValueContainer && (
      <components.ValueContainer {...props}>
        {!!children && <span className="dialog-select-prefix-icon">A</span>}
        {children}
      </components.ValueContainer>
    )
  )
}

const SelectIInputItem = ({ options, placeholder, onChange, name }) => {
  return (
    <div className="select-input-item">
      <Select
        options={options}
        placeholder={placeholder}
        components={{
          IndicatorSeparator: () => null,
          DropdownIndicator: () => (
            <div className="select-input-item-dropdown-indicator"></div>
          ),
          Placeholder: () => (
            <span className="select-input-item-placeholder">{placeholder}</span>
          ),
          ValueContainer,
        }}
        isSearchable={false}
        styles={styles}
        onChange={onChange}
        name={name}
      />
    </div>
  )
}

SelectIInputItem.propTypes = {
  options: PropTypes.arrayOf({
    label: PropTypes.string,
    value: PropTypes.string,
  }),
  placeholder: PropTypes.string,
}

SelectIInputItem.defaultProps = {
  options: [],
  placeholder: 'Select...',
}

export default SelectIInputItem
