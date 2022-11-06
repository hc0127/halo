import React from 'react'
import PropTypes from 'prop-types'
import utils from '../../utils/helpers'

const propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.number,
}

const AdminFormRow = ({ children, size }) => (
  <div className={utils.makeClass('admin-form__row', `size${size}`)}>
    {children}
  </div>
)

AdminFormRow.propTypes = propTypes

AdminFormRow.defaultProps = {
  size: 1,
}

export default AdminFormRow
