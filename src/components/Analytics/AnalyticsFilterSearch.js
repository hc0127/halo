import React, { useState } from 'react'
import PropTypes from 'prop-types'
import iconSearch from '../../images/icons/icon-search.svg'

const propTypes = {
  onClickSuggestion: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.string),
}

const AnalyticsFilterSearch = ({ onClickSuggestion, tags }) => {
  const [value, setValue] = useState('')
  return (
    <div className="analytics-filters__search">
      <input
        type="search"
        onChange={e => setValue(e.target.value)}
        value={value}
      />{' '}
      <img src={iconSearch} alt="" />
      <ul className="analytics-filters__search__suggestions">
        {tags &&
          value &&
          tags
            .filter(tagText =>
              tagText.toLowerCase().includes(value.toLowerCase()),
            )
            .map(text => (
              <li key={text}>
                <button
                  onClick={() => {
                    onClickSuggestion(text)
                    setValue('')
                  }}
                >
                  {text}
                </button>
              </li>
            ))}
      </ul>
    </div>
  )
}

AnalyticsFilterSearch.propTypes = propTypes
AnalyticsFilterSearch.defaultProps = {
  onClickSuggestion: () => {},
  tags: [],
}

export default AnalyticsFilterSearch
