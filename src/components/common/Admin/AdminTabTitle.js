import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
}
const AdminTabTitle = ({ children, selected, onClick }) => (
  <div /* eslint-disable-line */
    className={`admin-tab-title ${selected ? 'admin-tab-title__selected' : ''}`}
    onClick={() => onClick()}
  >
    {children}
  </div>
)

AdminTabTitle.propTypes = propTypes

AdminTabTitle.defaultProps = {
  selected: false,
  onClick: () => {},
}

export default AdminTabTitle
