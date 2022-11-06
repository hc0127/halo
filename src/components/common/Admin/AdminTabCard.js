import React, { Component, Children } from 'react'
import PropTypes from 'prop-types'

import AdminTabTitle from './AdminTabTitle'
import AdminTabContent from './AdminTabContent'

class AdminTabCard extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    ref: PropTypes.node,
  }

  static defaultProps = {
    ref: null,
  }

  constructor(props) {
    super(props)
    this.state = { selectedTabIndex: 0 }
  }

  handleTabClick(value) {
    this.setState({ selectedTabIndex: value })
  }

  render() {
    const children = React.Children.map(this.props.children, child => {
      if (child && child.type === React.Fragment) {
        return child.props.children
      }
      return child
    })

    const { selectedTabIndex } = this.state
    const { ref } = this.props

    const titles = children.filter(child => child.type === AdminTabTitle)

    const contents = children.filter(child => child.type === AdminTabContent)

    return (
      <div className="admin-tab-card">
        <div className="admin-tab-card__title-container">
          {Children.map(titles, (child, index) =>
            React.cloneElement(child, {
              selected: selectedTabIndex === index,
              onClick: () => this.handleTabClick(index),
            }),
          )}
        </div>
        <div className="admin-tab-card__content-container" ref={ref}>
          {Children.map(contents, (child, index) =>
            selectedTabIndex === index ? child : null,
          )}
        </div>
      </div>
    )
  }
}

export default AdminTabCard
