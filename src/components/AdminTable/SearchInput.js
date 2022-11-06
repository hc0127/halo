import React from 'react'
import PropTypes from 'prop-types'

import iconSearch from '../../images/icons/icon-search.svg'

const propTypes = {
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}
const SearchInput = ({ onChange, ...otherProps }) => (
  <div className="search-input">
    <input {...otherProps} onChange={e => onChange(e.target.value)} />
    <img src={iconSearch} alt="" />
  </div>
)

SearchInput.propTypes = propTypes

SearchInput.defaultProps = {}

export default SearchInput
