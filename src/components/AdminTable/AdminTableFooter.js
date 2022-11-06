import React from 'react'
import PropTypes from 'prop-types'

import { BUTTON_ICONS } from '../../utils/constants'
import Icon from '../common/Icon'

const propTypes = {
  totalPageCount: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPreviousPageClick: PropTypes.func.isRequired,
  onNextPageClick: PropTypes.func.isRequired,
  onPageClick: PropTypes.func.isRequired,
}

let randomKey = 1000

const AdminTableFooter = ({
  totalPageCount,
  currentPage,
  onPreviousPageClick,
  onNextPageClick,
  onPageClick,
}) => {
  const isPreviousPageEnabled = currentPage > 0
  const isNextPageEnabled = currentPage < totalPageCount - 1

  let pageNumbers = [...Array(Math.ceil(totalPageCount))].map(
    (_, index) => index,
  )

  if (totalPageCount > 10) {
    if (currentPage <= 2) {
      pageNumbers = [0, 1, 2, 3, null, totalPageCount - 1]
    } else if (currentPage >= totalPageCount - 3) {
      pageNumbers = [
        0,
        null,
        totalPageCount - 4,
        totalPageCount - 3,
        totalPageCount - 2,
        totalPageCount - 1,
      ]
    } else {
      pageNumbers = [
        0,
        null,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        null,
        totalPageCount - 1,
      ]
    }
  }

  return (
    <div className="admin-table__footer">
      <ul>
        <li>
          <button onClick={onPreviousPageClick}>
            <Icon
              icon={BUTTON_ICONS.PreviousPage}
              disabled={!isPreviousPageEnabled}
            />
          </button>
        </li>
        {pageNumbers.map(page => {
          randomKey += 1
          return (
            <li
              key={page !== null ? page : randomKey}
              className={currentPage === page ? 'active' : undefined}
            >
              <button onClick={page !== null ? () => onPageClick(page) : null}>
                {page !== null ? page + 1 : '...'}
              </button>
            </li>
          )
        })}
        <li>
          <button onClick={onNextPageClick}>
            <Icon icon={BUTTON_ICONS.NextPage} disabled={!isNextPageEnabled} />
          </button>
        </li>
      </ul>
    </div>
  )
}

AdminTableFooter.propTypes = propTypes

AdminTableFooter.defaultProps = {}

export default AdminTableFooter
