import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import { ROUTES } from '../../../utils/constants'
import Header from '../../Header'
import { SideMenu } from '../../index'

const LayoutAdmin = ({ children }) => (
  <>
    <Route path={ROUTES.Private.Dashboard} render={() => <Header />} />
    <Route
      path={ROUTES.Private.Dashboard}
      render={props => <SideMenu {...props} />}
    />
    {children}
  </>
)

LayoutAdmin.propTypes = {
  children: PropTypes.node.isRequired,
}

export default LayoutAdmin
