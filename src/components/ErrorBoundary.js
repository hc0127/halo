import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { logError } from '../stores/ReduxStores/errors'

class ErrorBoundary extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  }

  static defaultProps = {}

  constructor(props) {
    super(props)
    this.state = { error: null }
    this.logError = this.logError.bind(this)
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidMount() {
    window.onerror = this.logError
  }
  componentDidCatch(...args) {
    this.setState({ error: args })
    this.logError(args)
  }
  logError(args) {
    this.props.dispatch(logError(args))
    return true
  }
  render() {
    if (this.state.error) {
      return (
        <>
          <h2>An error occurred!</h2>
          <p>
            {
              "Sorry about that! We'll try to fix it as soon as possible. Until then, please refresh and try again!"
            }
            <pre>{this.state.error}</pre>
          </p>
        </>
      )
    }
    return this.props.children
  }
}

export default connect()(ErrorBoundary)
