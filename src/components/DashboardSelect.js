import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'

const optionShape = { label: PropTypes.string, value: PropTypes.string }

const propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape(optionShape)),
  onChange: PropTypes.func,
  value: PropTypes.shape(optionShape),
}

const DashboardSelect = ({ options, onChange, value }) => (
  <Select
    className="dashboard-select"
    classNamePrefix="dashboard-select"
    options={options}
    onChange={onChange}
    value={value}
    styles={{ menu: styles => ({ ...styles, zIndex: 999 }) }}
  />
)

DashboardSelect.propTypes = propTypes

DashboardSelect.defaultProps = {
  options: [],
  onChange: () => {},
  value: null,
}

export default DashboardSelect
