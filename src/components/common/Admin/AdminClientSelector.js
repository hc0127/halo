import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import { AdminField } from '.'

const propTypes = {
  value: PropTypes.string.isRequired,
  clients: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)),
  onChange: PropTypes.func,
  editing: PropTypes.bool,
}

const AdminClientSelector = ({ value, clients, editing, ...props }) => {
  const selectedClient = clients.filter(client => client.object_id === value)[0]
  const selectedClientName = selectedClient && selectedClient.name

  return (
    <div className="admin-client-selector">
      {editing ? (
        <span className="admin-client-selector__client-name">
          {selectedClientName}
        </span>
      ) : (
        <AdminField
          label=""
          placeholder="Choose client"
          type="dropdown"
          options={clients.map(client => ({
            value: client.object_id,
            label: client.name,
          }))}
          value={value}
          {...props}
        />
      )}
    </div>
  )
}

AdminClientSelector.propTypes = propTypes

AdminClientSelector.defaultProps = {
  clients: [],
  onChange: () => {},
  editing: true,
}

export default AdminClientSelector
