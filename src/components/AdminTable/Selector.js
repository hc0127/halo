import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  value: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    }),
  ).isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}
const Selector = ({ data, value, label, onChange }) => (
  <div className="selector">
    <select value={value} onChange={e => onChange(e.target.value)}> {/* eslint-disable-line */ }
      <option value="">{value ? `All ${label}` : `Filter ${label}`}</option>
      {data.map(filterValue => (
        <option value={filterValue.value} key={filterValue.value}>
          {filterValue.text}
        </option>
      ))}
    </select>
  </div>
)

Selector.propTypes = propTypes

Selector.defaultProps = {}

export default Selector
