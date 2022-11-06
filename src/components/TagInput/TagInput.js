import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import Tag from './Tag'
import utils from '../../utils/helpers'
import ClickableDiv from '../ClickableDiv'

let randomKey = 1000

const removeAtIndex = (array, indexToRemove) => {
  const newArray = [...array]
  newArray.splice(indexToRemove, 1)
  return newArray
}

class TagInput extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    tags: PropTypes.arrayOf(PropTypes.string),
    suggestedTags: PropTypes.arrayOf(PropTypes.string),
    submitting: PropTypes.bool,
    submitExcerpt: PropTypes.string,
    placeholder: PropTypes.string,
  }

  static defaultProps = {
    disabled: false,
    onChange: () => {},
    suggestedTags: [],
    tags: [],
    submitting: false,
    submitExcerpt: 'Press enter to submit your tag',
    placeholder: null,
  }

  constructor(props) {
    super(props)
    this.state = {
      tagValue: '',
      filteredTags: [],
      selectedTag: null,
      isPreviousTagSelected: false,
    }

    this.tagInput = createRef()
  }

  focusInput() {
    if (this.tagInput.current) this.tagInput.current.focus()
  }

  handleChange(newValue) {
    this.props.onChange([...this.props.tags, newValue])
    this.setState({ tagValue: '', isPreviousTagSelected: false })
    this.focusInput()
  }

  handleKeyUp(e, handleBackspace = false) {
    const { value } = e.target
    const { tagValue } = this.state
    let { filteredTags, selectedTag, isPreviousTagSelected } = this.state

    if (tagValue !== value) {
      filteredTags = this.props.suggestedTags
        .filter(tag => tag.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 3)

      selectedTag = null
      isPreviousTagSelected = false

      this.setState({
        filteredTags,
        selectedTag,
        isPreviousTagSelected,
        tagValue: value,
      })
    }

    if (!this.props.disabled && e.key === 'Enter' && value.length > 0) {
      if (selectedTag) {
        this.handleChange(selectedTag)
      } else {
        this.handleChange(value)
      }
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      let ind = filteredTags.indexOf(selectedTag)
      if (ind === -1) {
        ind = 0
      } else {
        ind += e.key === 'ArrowDown' ? 1 : -1
      }

      ind = ind < 0 ? 2 : ind % 3

      this.setState({ selectedTag: filteredTags[ind] })
    } else if (e.key === 'Escape') {
      this.setState({
        filteredTags: [],
        selectedTag: null,
        isPreviousTagSelected: false,
      })
    } else if (
      handleBackspace &&
      e.key === 'Backspace' &&
      this.props.tags.length &&
      !tagValue.length
    ) {
      if (!isPreviousTagSelected) {
        this.setState({ isPreviousTagSelected: true })
      } else {
        this.props.onChange([...this.props.tags].slice(0, -1))
      }
    }
  }

  render() {
    const { disabled, onChange, submitting, tags, placeholder } = this.props
    const {
      tagValue,
      filteredTags,
      selectedTag,
      isPreviousTagSelected,
    } = this.state

    return (
      <div className="tag-input-container">
        <div className="tag-input-container__border">
          <div className="tag-input-container__inner">
            <div /* eslint-disable-line */
              className={utils.makeClass('tag-input', disabled && 'disabled')}
              onClick={() => !disabled && this.focusInput()}
            >
              {tags.map((tagItem, i) => {
                randomKey += 1
                return (
                  <Tag
                    key={tagItem}
                    onClick={() =>
                      !disabled && onChange(removeAtIndex(tags, i))
                    }
                    selected={i === tags.length - 1 && isPreviousTagSelected}
                  >
                    {tagItem}
                  </Tag>
                )
              })}
              {!disabled && (
                <div className="tag-input__container">
                  <input
                    autoComplete="off"
                    type="text"
                    onChange={e => this.handleKeyUp(e)}
                    onKeyUp={e => this.handleKeyUp(e, true)}
                    id="tag-text-input"
                    ref={this.tagInput}
                    value={tagValue}
                    readOnly={submitting}
                    placeholder={placeholder}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {!disabled && (
          <div className="tag-input-container__tooltip">
            {this.props.submitExcerpt}
          </div>
        )}

        {this.tagInput.current &&
          tagValue.length > 0 &&
          filteredTags.length > 0 &&
          !disabled &&
          !submitting && (
            <ul
              className="tag-input__suggestions"
              style={{
                left: `${this.tagInput.current &&
                  this.tagInput.current.offsetLeft}px`,
              }}
            >
              {tagValue.length > 0 &&
                filteredTags.map(tag => {
                  randomKey += 1
                  return (
                    <li
                      key={`tag:${randomKey}`}
                      className={selectedTag === tag ? 'selected' : ''}
                    >
                      <ClickableDiv onClick={() => this.handleChange(tag)}>
                        {tag}
                      </ClickableDiv>
                    </li>
                  )
                })}
            </ul>
          )}
      </div>
    )
  }
}

export default TagInput
