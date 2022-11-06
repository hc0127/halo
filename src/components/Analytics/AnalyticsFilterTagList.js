import React from 'react'
import PropTypes from 'prop-types'
import Tag from './../TagInput/Tag'

const propTypes = {
  onChange: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.string),
}

const AnalyticsFilterTagList = ({ onChange, tags }) => (
  <div className="analytics-filters__tag-list">
    {tags.length > 0 && (
      <button
        className="analytics-filters__tag-list__remove-all"
        onClick={() => onChange('tags', [])}
      >
        Remove all
      </button>
    )}
    {tags.map(tag => (
      <Tag
        onClick={() =>
          onChange('tags', [...tags.filter(tagText => tagText !== tag)])
        }
        key={tag}
      >
        {tag}
      </Tag>
    ))}
  </div>
)

AnalyticsFilterTagList.propTypes = propTypes
AnalyticsFilterTagList.defaultProps = {
  onChange: () => {},
  tags: [],
}

export default AnalyticsFilterTagList
