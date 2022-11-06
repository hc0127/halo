import React from 'react'
import PropTypes from 'prop-types'
import { TITLE_TYPES, VARIANT } from './../../../utils/constants'

const propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(Object.values(TITLE_TYPES)),
  variant: PropTypes.oneOf(Object.values(VARIANT)),
}

const Title = ({ children, type: Type, variant }) => (
  <Type className={`title title--${variant}`}>{children}</Type>
)

Title.propTypes = propTypes

Title.defaultProps = {
  variant: VARIANT.Primary,
  type: TITLE_TYPES.h1,
}

export default Title
