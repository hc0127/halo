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
const SelectorEvents = ({ data, value, label, onChange }) => (
  <div className="selector">
    <select value={value} onChange={e => onChange(e.target.value)}> {/* eslint-disable-line */ }
      <option value="">{value ? `All ${label}` : `Filter ${label}`}</option>
      {data.map(filterValue => (
        <option value={filterValue.object_id} key={filterValue.object_id}>
          {filterValue.title}
        </option>
      ))}
    </select>
  </div>
)

SelectorEvents.propTypes = propTypes

SelectorEvents.defaultProps = {}

export default SelectorEvents
