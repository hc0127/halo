import React from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  nextPage: PropTypes.func.isRequired,
  previousPage: PropTypes.func.isRequired,
  jumpToPage: PropTypes.func.isRequired,
}

const TicketScanningTablePagination = ({
  currentPage,
  totalPages,
  nextPage,
  previousPage,
  jumpToPage,
}) => {
  let pagination = []

  for (let page = 1; page <= totalPages; page++) {
    const classes = ['page-number']

    if (currentPage === page) {
      classes.push('active')
    }

    pagination.push(
      <li key={page} className={classes.join(' ')}>
        <button onClick={() => jumpToPage(page)}>{page}</button>
      </li>,
    )
  }

  return (
    <div className="staff-table-pagination">
      <ul>
        <li className="previous-link" key="previous">
          <button onClick={previousPage} disabled={currentPage === 1}>
            <span
              className={
                currentPage === 1
                  ? 'icon icon-icon-page-back-disabled'
                  : 'icon icon-icon-page-back'
              }
            ></span>
          </button>
        </li>
        {pagination}
        <li className="next-link" key="next">
          <button onClick={nextPage} disabled={currentPage === totalPages}>
            <span
              className={
                currentPage === totalPages
                  ? 'icon icon-icon-page-forward-disabled'
                  : 'icon icon-icon-page-forward'
              }
            ></span>
          </button>
        </li>
      </ul>
    </div>
  )
}

TicketScanningTablePagination.propTypes = propTypes

export default TicketScanningTablePagination
