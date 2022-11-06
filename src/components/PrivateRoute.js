import React from 'react'
import PropTypes from 'prop-types'
import { Route, Redirect } from 'react-router-dom'

import { ROUTES } from '../utils/constants'

const PrivateRoute = ({ component: Component, render, loggedIn, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (!loggedIn) {
        return (
          <Redirect
            to={{
              pathname: ROUTES.Public.Login,
              state: { from: props.location },
            }}
          />
        )
      }

      if (render) {
        return render(props)
      }

      return <Component {...props} />
    }}
  />
)

PrivateRoute.propTypes = {
  component: PropTypes.node.isRequired,
  render: PropTypes.func.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  location: PropTypes.string.isRequired,
}

export default PrivateRoute
