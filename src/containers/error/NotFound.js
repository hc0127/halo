import React from 'react'
import { withRouter } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'
import { AdminPage, AdminButton } from '../../components/common/Admin'
import PropTypes from 'prop-types'

const propTypes = {
  history: PropTypes.object.isRequired,
}

const redirectToAdmin = history => {
  history.push(ROUTES.Private.Admin)
}

const NotFound = ({ history }) => {
  return (
    <AdminPage>
      <div className="not-found">
        <h1>Sorry, we couldn&apos;t find the page you was looking for.</h1>
        <AdminButton
          className="admin-button admin-button--primary"
          onClick={() => redirectToAdmin(history)}
          type="button"
        >
          Back to Admin
        </AdminButton>
      </div>
    </AdminPage>
  )
}

NotFound.propTypes = propTypes

export default withRouter(NotFound)
