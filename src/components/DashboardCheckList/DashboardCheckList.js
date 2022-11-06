import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Parse from 'parse'
import { Link } from 'react-router-dom'
import moment from 'moment'
import {
  loadChecks,
  loadMoreChecks,
  filterChecks,
  clearChecks,
} from '../../stores/ReduxStores/dashboard/eventChecks'
import utils from '../../utils/helpers'
import Loading from '../common/Loading/Loading'
import DashboardRightPanelViewSelector from '../Dashboard/DashboardRightPanelViewSelector'
import {
  CHECK_STATUS,
  CHECK_STATUS_PLACEHOLDER,
  CHECK_TYPE,
  CHECK_TYPE_TEXT,
  CHECK_STATUS_TEXT,
} from '../../utils/constants'
import DashboardSelect from '../DashboardSelect'
import DashboardCheckListGroup from './DashboardCheckListGroup'
import { getEventCheckStatusCounts } from '../../api/events'
import { useInterval } from '../../utils/customHooks'

const propTypes = {
  event: PropTypes.instanceOf(Parse.Object),
  checks: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  loading: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  onMapPage: PropTypes.bool,
  canUserLoadMoreChecks: PropTypes.bool.isRequired,
}

const filterChecksByStatuses = (checks, statuses) =>
  checks.filter(check => statuses.includes(utils.getEventCheckStatus(check)))
const filterChecksByType = (checks, type) =>
  checks.filter(check => check.admin_check.event_type === type)

const filteringByTypeOptions = [
  { label: 'All', value: '' },
  ...Object.values(CHECK_TYPE).map(type => ({
    label: CHECK_TYPE_TEXT[type],
    value: type,
  })),
]

const DashboardCheckList = ({
  event,
  checks,
  loading,
  dispatch,
  onMapPage,
  canUserLoadMoreChecks,
}) => {
  const panelRef = useRef(null)
  const [filters, setFilters] = useState({
    eventType: '',
    statuses: [],
  })
  const [filterByType, setFilterByType] = useState(filteringByTypeOptions[0])
  const [filterByStatuses, setFilterByStatuses] = useState([])
  const [counts, setCounts] = useState({})

  useEffect(() => {
    dispatch(loadChecks())
    fetchCounts()

    return () => dispatch(clearChecks())
  }, [dispatch])

  useEffect(() => {
    dispatch(filterChecks(filters))
  }, [dispatch, filters])

  const updateFilters = (filterKey, filterVal) =>
    setFilters(prevFilters => ({ ...prevFilters, [filterKey]: filterVal }))

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
    ({ value: eventType }) => {
      updateFilters('eventType', eventType)
      setFilterByType(eventType)
    },
    [setFilterByType],
  )

  const fetchCounts = async () => {
    const counts = await getEventCheckStatusCounts(event.object_id)
    setCounts(counts)
  }

  const filteredByDashboardCheckRequirements = useMemo(
    () =>
      checks.filter(check =>
        [
          CHECK_STATUS.Pending,
          CHECK_STATUS.UnableToComplete,
          CHECK_STATUS.Late,
        ].includes(utils.getEventCheckStatus(check)),
      ),
    [checks],
  )

  const filteredByType = useMemo(() => {
    if (!filteredByDashboardCheckRequirements) {
      return null
    }

    return filterByType && filterByType.value
      ? filterChecksByType(
          filteredByDashboardCheckRequirements,
          filterByType.value,
        )
      : filteredByDashboardCheckRequirements
  }, [filteredByDashboardCheckRequirements, filterByType])

  const filtered = useMemo(() => {
    if (!filteredByType) {
      return null
    }

    return utils.sortByMultiple(
      filterByStatuses.length
        ? filterChecksByStatuses(filteredByType, filterByStatuses)
        : filteredByType,
      { occursAt: 1 },
    )
  }, [filteredByType, filterByStatuses])

  const groupedChecks = useMemo(
    () =>
      utils.groupItemsBy(filtered, check =>
        moment
          .utc(check.occurs_at)
          .startOf('day')
          .format(),
      ),
    [filtered],
  )

  const onScrollChecks = () => {
    const { scrollTop, scrollHeight, clientHeight } = panelRef.current
    const totalChecksOnPage = checks.length

    if (
      scrollTop > 0 &&
      Math.ceil(scrollTop + clientHeight) >= scrollHeight &&
      canUserLoadMoreChecks
    ) {
      dispatch(loadMoreChecks(totalChecksOnPage, filters))
    }
  }

  useInterval(() => {
    fetchCounts()
  }, 5000)

  return (
    <section className={utils.makeClass('check-list', onMapPage && 'map-page')}>
      <div className="check-list__header">
        <div className="check-list__header__title">
          <DashboardRightPanelViewSelector />
        </div>
        <label
          className="check-list__header__search-container"
          htmlFor={filterByType}
        >
          Filter by:
          <DashboardSelect
            value={filteringByTypeOptions.find(
              ({ value }) => value === filterByType,
            )}
            onChange={onFilterTypeHandler}
            options={filteringByTypeOptions}
          />
        </label>
      </div>
      <div className="check-list__content">
        {loading ? (
          <Loading />
        ) : (
          <>
            <div
              className="check-list__items-container"
              ref={panelRef}
              onScroll={onScrollChecks}
            >
              <div className="check-list__items-summary">
                <div className="check-list__items-summary__title">
                  Filter by status:
                </div>

                {CHECK_STATUS_PLACEHOLDER.filter(
                  ({ status }) => status !== 'complete',
                ).map(({ status }) => {
                  return (
                    <div /* eslint-disable-line */
                      key={status}
                      className={utils.makeClass(
                        'check-list__items-summary__item',
                        filters.statuses.includes(status) ? 'active' : null,
                      )}
                      onClick={() => onFilterByStatusHandler(status)}
                    >
                      <div
                        className={utils.makeClass('check-status', status)}
                      />
                      <div className="check-list__items-summary__item__title">
                        {Object.values(counts).length &&
                          `${counts[status]} ${CHECK_STATUS_TEXT[status]}`}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="check-list__groups">
                {filtered.length ? (
                  Object.keys(groupedChecks).map(key => (
                    <DashboardCheckListGroup
                      key={key}
                      checks={groupedChecks[key]}
                      date={moment(key)}
                    />
                  ))
                ) : (
                  <div className="check-list__items__empty">
                    No checks found
                  </div>
                )}
              </div>
            </div>

            <div className="check-list__footer">
              <Link
                className="button-with-icon button-with-icon--primary"
                to={`/dashboard/${event.object_id}/venue-checks`}
              >
                <small>View all Tasks</small>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

DashboardCheckList.propTypes = propTypes

DashboardCheckList.defaultProps = {
  event: null,
  onMapPage: false,
}

export default connect(state => ({
  checks: Object.values(state.eventChecks.data),
  event: state.currentEvent.event,
  loading: state.eventChecks.status === 'loading',
  canUserLoadMoreChecks:
    state.eventChecks.count !== Object.values(state.eventChecks.data).length,
}))(DashboardCheckList)
