import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'

import { cacheEventId } from '../../stores/ReduxStores/dashboard/currentEvent'
import {
  DashboardSlidingPanel,
  DashboardDialogPanel,
} from '../../components/Dashboard'
import {
  loadChecks,
  filterChecks,
  clearChecks,
} from '../../stores/ReduxStores/dashboard/eventChecks'
import VenueCheckList from '../../components/VenueCheck/VenueCheckList'
import AdminButton from '../../components/common/Admin/AdminButton'
import {
  CHECK_STATUS_PLACEHOLDER,
  CHECK_TYPE_FILTERS,
  CHECK_STATUS_TEXT,
  ROUTES,
} from '../../utils/constants'
import utils from '../../utils/helpers'
import { loadStaff } from '../../stores/ReduxStores/dashboard/staff'
import { exportPDF, getEventCheckStatusCounts } from '../../api/events'
import debounce from 'lodash.debounce'
import PaginationLoader from '../../components/PaginationLoader'
import { useInterval } from '../../utils/customHooks'

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({ id: PropTypes.string.isRequired }),
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  checks: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)),
  event: PropTypes.instanceOf(Parse.Object),
  loading: PropTypes.bool.isRequired,
  currentPageChecks: PropTypes.number.isRequired,
  nextPageChecks: PropTypes.number.isRequired,
  prevPageChecks: PropTypes.number.isRequired,
}

const defaultProps = {
  checks: [],
  event: {},
}

const VenueChecksPage = ({
  checks,
  event,
  dispatch,
  match,
  loading,
  nextPageChecks,
  prevPageChecks,
  currentPageChecks,
}) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    eventType: '',
    statuses: [],
  })
  const [counts, setCounts] = useState({})

  useEffect(() => {
    dispatch(cacheEventId(match.params.id))
  }, [dispatch, match.params.id])

  useEffect(() => {
    dispatch(loadChecks())
    dispatch(loadStaff())

    return () => dispatch(clearChecks())
  }, [dispatch])

  useEffect(() => {
    dispatch(filterChecks(filters))

    const fetchFilteredCounts = async () => {
      const updatedCounts = await getEventCheckStatusCounts(
        event.object_id,
        filters.searchTerm,
        filters.eventType,
      )
      setCounts(updatedCounts)
    }

    if (event) fetchFilteredCounts()
  }, [dispatch, filters])

  useInterval(() => {
    dispatch(filterChecks(filters, true, currentPageChecks))
  }, 5000)

  useInterval(() => {
    fetchCounts()
  }, 5000)

  useEffect(() => {
    if (event) fetchCounts()
  }, [event])

  const fetchCounts = async () => {
    const counts = await getEventCheckStatusCounts(
      event.object_id,
      filters.searchTerm,
      filters.eventType,
    )
    setCounts(counts)
  }

  const [filterByType, setFilterByType] = useState('all')
  const [search, setSearch] = useState('')

  const updateFilters = (filterKey, filterVal) =>
    setFilters(prevFilters => ({ ...prevFilters, [filterKey]: filterVal }))

  const debounceFn = useCallback(debounce(onSearchHandler, 1000), [])

  function handleChange(e) {
    e.persist()
    setSearch(e.target.value)
    debounceFn(e.target.value)
  }

  function onSearchHandler(searchTerm) {
    updateFilters('searchTerm', searchTerm)
  }

  // Change this if you want to filter only by one status at a time
  const onFilterByStatusHandler = useCallback(status => {
    const statuses = [...filters.statuses]
    if (statuses.includes(status)) {
      statuses.splice(statuses.indexOf(status), 1)
    } else {
      statuses.push(status)
    }
    updateFilters('statuses', statuses)
  })

  const onFilterTypeHandler = useCallback(
    ({ target: { value: eventType } }) => {
      updateFilters('eventType', eventType)
      setFilterByType(eventType)
    },
    [setFilterByType],
  )

  const isChecksFeatureAvailable = useMemo(() => {
    return event ? utils.hasHaloChecks(event.client) : true
  }, [event])

  if (!isChecksFeatureAvailable) {
    window.location.href = ROUTES.Private.Dashboard.replace(':id', event.id)
    return
  }

  const handleExportPDF = async () => {
    const eventId = match.params.id
    const contents = await exportPDF(eventId)
    var blob = new Blob([contents], { type: 'application/pdf' })
    var link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    var fileName = `halo-checks-export-${eventId}`
    link.download = fileName
    link.click()
  }

  const traverseChecks = direction => {
    const chosenDirection = { next: nextPageChecks, prev: prevPageChecks }[
      direction
    ]

    dispatch(filterChecks(filters, false, chosenDirection))
  }

  return (
    <div className="venue-checks-page">
      <DashboardSlidingPanel />
      <DashboardDialogPanel />
      <div className="venue-checks-page__container">
        <div className="venue-checks-page__left-panel">
          {loading && <PaginationLoader />}
          <div className="venue-checks-page__left-panel__header">
            <div className="venue-checks-page__left-panel__header__search">
              <input
                value={search}
                placeholder="Search title or assignee"
                onChange={e => handleChange(e)}
              />
            </div>
            <label>
              Filter by type:
              <div className="venue-checks-page__left-panel__header__filter selector">
                <select value={filterByType} onChange={onFilterTypeHandler}>
                  {' '}
                  {/*eslint-disable-line*/}
                  {CHECK_TYPE_FILTERS.map(type => (
                    <option key={type.filter} value={type.filter}>
                      {type.text}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
          <div className="venue-checks-page__left-panel__header__items-summary">
            <div className="venue-checks-page__left-panel__header__items-summary__name">
              Filter by status:
            </div>

            {CHECK_STATUS_PLACEHOLDER.map(({ status }) => (
              <div // eslint-disable-line
                key={status}
                className={utils.makeClass(
                  'check-list__items-summary__item',
                  filters.statuses.includes(status) ? 'active' : null,
                )}
                onClick={() => onFilterByStatusHandler(status)}
              >
                <div className={utils.makeClass('check-status', status)} />
                <div className="check-list__items-summary__item__title">
                  {Object.values(counts).length &&
                    `${counts[status]} ${CHECK_STATUS_TEXT[status]}`}
                </div>
              </div>
            ))}

            <AdminButton onClick={() => handleExportPDF()}>
              Download
            </AdminButton>
          </div>

          <VenueCheckList checks={checks} traverseChecks={traverseChecks} />
        </div>
        <div className="venue-checks-page__right-panel">
          <h3>Select a task to view its details</h3>
          <p>Choose a task from the list to view its details and messages.</p>
        </div>
      </div>
    </div>
  )
}

VenueChecksPage.propTypes = propTypes

VenueChecksPage.defaultProps = defaultProps

export default connect(state => ({
  checks: Object.values(state.eventChecks.data),
  nextPageChecks: state.eventChecks.pagination.nextPage,
  prevPageChecks: state.eventChecks.pagination.prevPage,
  currentPageChecks: state.eventChecks.pagination.currentPage,
  canUserLoadMoreChecks:
    state.eventChecks.count !== Object.values(state.eventChecks.data).length,
  event: state.currentEvent.event,
  staff: state.staff.data,
  loading: state.eventChecks.status === 'loading',
  isReloading: state.eventChecks.status === 'reloading',
}))(VenueChecksPage)
