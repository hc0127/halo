import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { UserContext } from '../../Contexts'
import {
  AUTHORISATION_MATCH_TYPES,
  USER_PERMISSIONS_ALL,
} from '../../utils/constants'

const propTypes = {
  permissions: PropTypes.arrayOf(PropTypes.oneOf([...USER_PERMISSIONS_ALL]))
    .isRequired,
  match: PropTypes.string.isRequired,
  fallback: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

const matchOnePermission = (permissions, userPermissions) => {
  return permissions.some(
    permission => userPermissions.indexOf(permission) !== -1,
  )
}

const matchAllPermissions = (permissions, userPermissions) => {
  return permissions.every(
    permission => userPermissions.indexOf(permission) !== -1,
  )
}

const isAuthorised = (match, permissions, userPermissions) => {
  switch (match) {
    case AUTHORISATION_MATCH_TYPES.one:
      // At least one permission should be available for the user.
      return matchOnePermission(permissions, userPermissions)
    case AUTHORISATION_MATCH_TYPES.all:
      // All permissions should be available for the user.
      return matchAllPermissions(permissions, userPermissions)
    default:
      return false
  }
}

const Authorisation = ({
  children,
  match,
  permissions,
  fallback = () => {},
}) => {
  const user = useContext(UserContext)
  const userPermissions = [user.permission_role]

  return (
    <>
      {isAuthorised(match, permissions, userPermissions)
        ? children
        : fallback()}
    </>
  )
}

Authorisation.propTypes = propTypes

export default Authorisation
