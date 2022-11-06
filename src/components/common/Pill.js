import React from 'react'
import PropTypes from 'prop-types'

import { PILL_VARIANT } from '../../utils/constants'
import util from './../../utils/helpers'

const Pill = ({ variant }) => (
  <span className={`pill pill--${variant}`}>{util.makeReadable(variant)}</span>
)

Pill.propTypes = {
  variant: PropTypes.oneOf(Object.values(PILL_VARIANT)).isRequired,
}

Pill.defaultProps = {}

export default Pill
