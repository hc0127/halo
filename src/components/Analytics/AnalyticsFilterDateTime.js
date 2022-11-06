import React from 'react'
import PropTypes from 'prop-types'
import ReactDatepicker from 'react-datepicker'
import moment from 'moment'

const propTypes = {
  value: PropTypes.instanceOf(moment),
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
}

const AnalyticsFilterDateTime = ({ value, onChange, label }) => (
  <div className="analytics-filters__datetime">
    <ReactDatepicker
      selected={value}
      onChange={val => onChange(val)}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="DD/MM/YYYY HH:mm"
      timeCaption="Time"
      placeholderText={label}
      isClearable
    />
  </div>
)

AnalyticsFilterDateTime.propTypes = propTypes

AnalyticsFilterDateTime.defaultProps = {
  value: null,
}

export default AnalyticsFilterDateTime
