import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  selectedRowIds: PropTypes.arrayOf(PropTypes.string).isRequired,
}

const AdminTableSelectionPanel = ({ selectedRowIds }) => (
  <div className="admin-table__selection-panel">
    {selectedRowIds.length ? `${selectedRowIds.length} row(s) selected` : ''}
  </div>
)

AdminTableSelectionPanel.propTypes = propTypes
AdminTableSelectionPanel.defaultProps = {}

export default AdminTableSelectionPanel
