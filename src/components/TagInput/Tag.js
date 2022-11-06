import React from 'react'
import PropTypes from 'prop-types'
import ClickableDiv from './../ClickableDiv'
import { Icon } from '../common'
import { getIcon } from '../../stores/IconStore'

const propTypes = {
  children: PropTypes.node.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
}

const Tag = ({ children, onClick, selected }) => (
  <div
    className={'tag-input__tag' + (selected ? ' tag-input__tag--selected' : '')}
  >
    {children}
    <ClickableDiv onClick={onClick}>
      <Icon src={getIcon('cross')} size={10} />
    </ClickableDiv>
  </div>
)

Tag.propTypes = propTypes

Tag.defaultProps = {
  selected: false,
}

export default Tag
