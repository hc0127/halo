import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node.isRequired,
  loadMore: PropTypes.func,
}

const defaultProps = {
  loadMore: () => {},
}

const AdminPage = ({ children, loadMore }) => {
  const handleScroll = e => {
    const totalHeight = Math.round(e.target.scrollHeight - e.target.scrollTop)
    const bottom = totalHeight === e.target.clientHeight

    if (bottom) loadMore()
  }

  return (
    <div className="admin-page" onScroll={handleScroll}>
      {children}
    </div>
  )
}

AdminPage.propTypes = propTypes
AdminPage.defaultProps = defaultProps

export default AdminPage
