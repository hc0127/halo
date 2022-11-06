import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { USER_PERMISSIONS } from '../../../utils/constants'
import { withUserContext } from '../../../Contexts'

const propTypes = {
  name: PropTypes.string.isRequired,
  clientName: PropTypes.string,
  children: PropTypes.node,
  currentUser: PropTypes.instanceOf(Parse.User).isRequired,
}

const AdminTempName = ({ name, clientName, children, currentUser }) => (
  <div className="admin-temp-name">
    <div className="admin-temp-name__container">
      <div>{name}</div>
      {clientName &&
        currentUser.permission_role === USER_PERMISSIONS.CrestAdmin && (
          <div className="admin-temp-name__client">{clientName}</div>
        )}
    </div>
    {children}
  </div>
)

AdminTempName.propTypes = propTypes

AdminTempName.defaultProps = {
  clientName: '',
  children: null,
}

export default withUserContext(AdminTempName)
