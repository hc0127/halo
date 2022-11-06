import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'

import MapPage from './containers/dashboard/MapPage'
import BansPage from './containers/dashboard/BansPage'
import ReportPage from './containers/dashboard/ReportPage'
import DebriefPage from './containers/dashboard/DebriefPage'
import DocumentLibrary from './containers/dashboard/DocumentLibrary'
import LoginPage from './containers/auth/LoginPage'
import NotFound from './containers/error/NotFound'
import AdminClientsPage from './containers/admin/AdminClientsPage'
import AdminClientDetailsPage from './containers/admin/AdminClientDetailsPage'
import AdminEventsPage from './containers/admin/AdminEventsPage'
import AdminEventDetailPage from './containers/admin/AdminEventDetailPage'
import AdminUsersPage from './containers/admin/AdminUsersPage'
import EventPage from './containers/dashboard/EventPage'
import AdminUserDetailPage from './containers/admin/AdminUserDetailPage'
import AdminTicketScanningPage from './containers/admin/AdminTicketScanningPage'
import AdminGroupsPage from './containers/admin/AdminGroupsPage'
import AdminGroupDetailPage from './containers/admin/AdminGroupDetailPage'
import DashboardPage from './containers/dashboard/DashboardPage'
import TicketScanningReportPage from './containers/dashboard/TicketScanningReportPage'
import VenueChecksPage from './containers/dashboard/VenueChecksPage'
import AnalyticsPage from './containers/dashboard/AnalyticsPage'
import PasswordResetPage from './containers/auth/PasswordResetPage'
import ReportIncidentPage from './containers/form/ReportIncidentPage'
import AdminDocumentUploadPage from './containers/admin/AdminDocumentUploadPage'

import Authorisation from './components/Authorisation'
import LayoutAdmin from './components/Layouts/LayoutAdmin'
import LayoutDashboard from './components/Layouts/LayoutDashboard'

import { setUser } from './stores/ReduxStores/auth'

import { Loading } from './components/common'

import {
  AUTHORISATION_MATCH_TYPES,
  ROUTES,
  USER_PERMISSIONS,
} from './utils/constants'
import utils from './utils/helpers'

import './app.scss'

import {
  UserContext,
  CustomIncidentTypesContext,
  HeaderLogoSrcContext,
} from './Contexts'

export const PublicRoutes = ({ isAlertOpen, toggleAlert }) => {
  return (
    <Router>
      <Switch>
        <Route
          exact
          path={ROUTES.Public.Login}
          component={props => (
            <LoginPage
              {...props}
              isAlertOpen={isAlertOpen}
              toggleAlert={toggleAlert}
            />
          )}
        />
        <Route
          path={ROUTES.Public.PasswordReset}
          render={props => (
            <PasswordResetPage
              {...props}
              isAlertOpen={isAlertOpen}
              toggleAlert={toggleAlert}
            />
          )}
        />
        <Route
          path={ROUTES.Public.ReportIncidentStadium}
          component={ReportIncidentPage}
        />
        <Route
          path={ROUTES.Public.ReportIncidentFestival}
          component={ReportIncidentPage}
        />
        <Route
            path={ROUTES.Public.ReportIncidentARFestival}
            component={ReportIncidentPage}
        />
        <Route
            path={ROUTES.Public.ReportIncidentGlastonbury}
            component={ReportIncidentPage}
        />
        <Redirect to="/login" />
      </Switch>
    </Router>
  )
}

const PrivateRoutes = ({
  currentUser,
  customIncidentTypes,
  customLogoSrc,
  isLoading,
  isAlertOpen,
  toggleAlert,
}) => {
  return (
    <>
      {isLoading ? (
        <Loading centered />
      ) : (
        <Router>
          <Switch>
            <Route
              exact
              path={ROUTES.Private.EventList}
              render={props => (
                <UserContext.Provider value={currentUser}>
                  <EventPage {...props} />
                </UserContext.Provider>
              )}
            />
            <Route
              path={ROUTES.Public.PasswordReset}
              render={props => (
                <PasswordResetPage
                  {...props}
                  isAlertOpen={isAlertOpen}
                  toggleAlert={toggleAlert}
                />
              )}
            />
            {utils.hasPermission(currentUser, [
              USER_PERMISSIONS.CrestAdmin,
              USER_PERMISSIONS.ClientManager,
            ]) &&
              // !currentUser.suspended &&
               (
                <Route
                  path="/admin/"
                  render={() => (
                    <UserContext.Provider value={currentUser}>
                      <LayoutAdmin>
                        <Switch>
                          <Route
                            exact
                            path={ROUTES.Private.Admin}
                            render={() => (
                              <Redirect
                                to={
                                  currentUser.permission_role ===
                                  USER_PERMISSIONS.CrestAdmin
                                    ? ROUTES.Private.AdminClients
                                    : ROUTES.Private.AdminEvents
                                }
                              />
                            )}
                          />

                          <Route
                            path={ROUTES.Private.AdminClients}
                            render={() => (
                              <Authorisation
                                permissions={[USER_PERMISSIONS.CrestAdmin]}
                                match={AUTHORISATION_MATCH_TYPES.one}
                                fallback={() => (
                                  <Redirect to={ROUTES.Private.Admin} />
                                )}
                              >
                                <Switch>
                                  <Route
                                    exact
                                    path={ROUTES.Private.AdminClientCreate}
                                    render={props => (
                                      <AdminClientDetailsPage
                                        newClient
                                        {...props}
                                      />
                                    )}
                                  />
                                  <Route
                                    exact
                                    path={ROUTES.Private.AdminClients}
                                    component={AdminClientsPage}
                                  />
                                  <Route
                                    exact
                                    path={ROUTES.Private.AdminClientEdit}
                                    component={AdminClientDetailsPage}
                                  />
                                  <Route component={NotFound} />
                                </Switch>
                              </Authorisation>
                            )}
                          />

                          <Route
                            exact
                            path={ROUTES.Private.AdminUserCreate}
                            render={props => (
                              <AdminUserDetailPage newUser {...props} />
                            )}
                          />
                          <Route
                            exact
                            path={ROUTES.Private.AdminUsers}
                            component={AdminUsersPage}
                          />
                          <Route
                            exact
                            path={ROUTES.Private.AdminUserEdit}
                            component={AdminUserDetailPage}
                          />

                          <Route
                            exact
                            path={ROUTES.Private.AdminEventCreate}
                            render={props => (
                              <AdminEventDetailPage newEvent {...props} />
                            )}
                          />
                          <Route
                            exact
                            path={ROUTES.Private.AdminEventCopy}
                            render={props => (
                              <AdminEventDetailPage duplicateEvent {...props} />
                            )}
                          />
                          <Route
                            exact
                            path={ROUTES.Private.AdminEvents}
                            component={AdminEventsPage}
                          />
                          <Route
                            exact
                            path={ROUTES.Private.AdminEventEdit}
                            component={AdminEventDetailPage}
                          />

                          <Route
                            exact
                            path={ROUTES.Private.AdminUserGroups}
                            component={AdminGroupsPage}
                          />
                          <Route
                            exact
                            path={ROUTES.Private.AdminUserGroupCreate}
                            render={props => (
                              <AdminGroupDetailPage newGroup {...props} />
                            )}
                          />
                          <Route
                            exact
                            path={ROUTES.Private.AdminUserGroupEdit}
                            render={props => (
                              <AdminGroupDetailPage {...props} />
                            )}
                          />

                          <Route
                            exact
                            path={ROUTES.Private.AdminTicketScanning}
                            component={AdminTicketScanningPage}
                          />

                          <Route
                            exact
                            path={ROUTES.Private.AdminDocumentUpload}
                            component={AdminDocumentUploadPage}
                          />

                          <Route
                            exact
                            path="/admin/test-error"
                            render={() => (
                              <button
                                onClick={() => this.thisFunctionDoesntExist()}
                              >
                                Click me
                              </button>
                            )}
                          />

                          <Route component={NotFound} />
                        </Switch>
                      </LayoutAdmin>
                    </UserContext.Provider>
                  )}
                />
              )}
            {utils.hasPermission(currentUser, [
              USER_PERMISSIONS.CrestAdmin,
              USER_PERMISSIONS.ClientManager,
              USER_PERMISSIONS.EventManager,
              USER_PERMISSIONS.TargetedDashboardUser,
            ]) &&
              !currentUser.suspended && (
                <Route
                  path="/"
                  render={() => (
                    <UserContext.Provider value={currentUser}>
                      <HeaderLogoSrcContext.Provider value={customLogoSrc}>
                        <CustomIncidentTypesContext.Provider
                          value={customIncidentTypes}
                        >
                          <LayoutDashboard>
                            <Switch>
                              <Route
                                exact
                                path={ROUTES.Private.Dashboard}
                                component={DashboardPage}
                              />

                              <Route
                                exact
                                path={ROUTES.Private.DashboardAnalytics}
                                component={AnalyticsPage}
                              />

                              <Route
                                exact
                                path={ROUTES.Private.DashboardMap}
                                render={props => <MapPage {...props} />}
                              />
                              <Route
                                exact
                                path={ROUTES.Private.DashboardBans}
                                render={props => <BansPage {...props} />}
                              />
                              <Route
                                exact
                                path={ROUTES.Private.DashboardReport}
                                render={props => <ReportPage {...props} />}
                              />
                              <Route
                                exact
                                path={
                                  ROUTES.Private.DashboardTicketScanningReport
                                }
                                render={props => (
                                  <TicketScanningReportPage {...props} />
                                )}
                              />
                              <Route
                                exact
                                path={ROUTES.Private.DashboardVenueChecks}
                                render={props => <VenueChecksPage {...props} />}
                              />
                              <Route
                                exact
                                path={ROUTES.Private.DashboardDebrief}
                                render={props => <DebriefPage {...props} />}
                              />
                              <Route
                                exact
                                path={ROUTES.Private.DashboardDocumentLibrary}
                                render={props => <DocumentLibrary {...props}/>}
                                />
                              <Redirect to={ROUTES.Private.EventList} />
                            </Switch>
                          </LayoutDashboard>
                        </CustomIncidentTypesContext.Provider>
                      </HeaderLogoSrcContext.Provider>
                    </UserContext.Provider>
                  )}
                />
              )}
            <Redirect to={ROUTES.Private.EventList} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      )}
    </>
  )
}

const MasterRouter = ({
  currentUser,
  customIncidentTypes,
  customLogoSrc,
  dispatch,
  isLoading,
}) => {
  const loggedInUser = localStorage.getItem('user')
  const [isAlertOpen, toggleAlert] = useState(false)
  const alertProps = { isAlertOpen, toggleAlert }
  const isUserError = loggedInUser === 'undefined' || loggedInUser === undefined

  useEffect(() => {
    if (isUserError) {
      localStorage.clear()
      window.location.reload()
    } else if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser)
      dispatch(setUser(foundUser))
    }
  }, [dispatch, loggedInUser])

  return (
    <>
      {loggedInUser && !isUserError && (
        <PrivateRoutes
          currentUser={currentUser}
          customIncidentTypes={customIncidentTypes}
          customLogoSrc={customLogoSrc}
          isLoading={isLoading}
          {...alertProps}
        />
      )}
      {!loggedInUser && <PublicRoutes {...alertProps} />}
    </>
  )
}

export default connect()(MasterRouter)

const routerPropTypes = {
  currentUser: PropTypes.object.isRequired,
  customIncidentTypes: PropTypes.array.isRequired,
  customLogoSrc: PropTypes.string,
}

MasterRouter.propTypes = {
  ...routerPropTypes,
  isLoading: PropTypes.bool.isRequired,
}

PrivateRoutes.propTypes = {
  ...routerPropTypes,
  dispatch: PropTypes.func.isRequired,
  isAlertOpen: PropTypes.bool.isRequired,
  toggleAlert: PropTypes.func.isRequired,
}

PublicRoutes.propTypes = {
  isAlertOpen: PropTypes.bool.isRequired,
  toggleAlert: PropTypes.func.isRequired,
}

PrivateRoutes.defaultProps = {
  customLogoSrc: '', // eslint-disable-line
}
