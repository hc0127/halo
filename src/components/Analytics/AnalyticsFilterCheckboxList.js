import React from 'react'
import PropTypes from 'prop-types'

import NiceCheckbox from '../AdminTable/NiceCheckbox'
import ClickableDiv from '../ClickableDiv'

const propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCheck: PropTypes.func.isRequired,
  onCheckAll: PropTypes.func.isRequired,
}

const AnalyticsFilterCheckboxList = ({
  options,
  values,
  onCheck,
  onCheckAll,
}) => (
  <div className="analytics-filters__checkbox-list">
    <div className="analytics-filters__checkbox-list__selectors">
      <ClickableDiv onClick={() => onCheckAll(false)}>Remove All</ClickableDiv>
      <ClickableDiv onClick={() => onCheckAll(true)}>Select All</ClickableDiv>
    </div>
    <div className="analytics-filters__checkbox-list__list">
      {options.map(option => (
        <div key={option.id}>
          <NiceCheckbox
            onChange={checked => onCheck(option, checked)}
            checked={values.includes(option.id)}
          />
          {option.label}
        </div>
      ))}
    </div>
  </div>
)

AnalyticsFilterCheckboxList.propTypes = propTypes

AnalyticsFilterCheckboxList.defaultProps = {}

export default AnalyticsFilterCheckboxList
