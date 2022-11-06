import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import Parse from 'parse'

import MasterRouter from './Router'
class App extends React.Component {
  static propTypes = {
    currentUser: PropTypes.instanceOf(Parse.User),
    customIncidentTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
    customLogoSrc: PropTypes.string,
    isLoading: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    currentUser: null,
    customLogoSrc: null,
  }

  componentDidMount() {
    console.log('PROCESS ENV', process.env)
  }

  render() {
    const {
      currentUser,
      customIncidentTypes,
      customLogoSrc,
      isLoading,
    } = this.props

    return (
      <main className="base">
        <MasterRouter
          currentUser={currentUser}
          customIncidentTypes={customIncidentTypes}
          customLogoSrc={customLogoSrc}
          isLoading={isLoading}
        />
      </main>
    )
  }
}

export default compose(
  connect(state => ({
    currentUser: state.auth.currentUser,
    isLoading: state.auth.isLoading,
    customIncidentTypes: state.incidentForm.incidents.filter(form =>
      form.type.startsWith('custom'),
    ),
    customLogoSrc: state.currentEvent.event?.custom_logo_file?.url,
  })),
)(App)
