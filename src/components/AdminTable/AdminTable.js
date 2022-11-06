import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'

import { ADMIN_TABLE_VARIANTS, BUTTON_ICONS } from '../../utils/constants'

import {
  AdminTableHeader,
  AdminTableBody,
  AdminTableFooter,
  AdminTableSelectionPanel,
  Selector,
} from '.'

import {
  updateFilterClientId,
  updateFilterValue,
  updateFilterYear,
  updateFilterMonth,
} from '../../stores/ReduxStores/admin/admin'
import moment from 'moment'

class AdminTable extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    globalActions: PropTypes.arrayOf(
      PropTypes.shape({
        icon: PropTypes.oneOf(Object.values(BUTTON_ICONS)),
        title: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
      }),
    ),
    customRenders: PropTypes.arrayOf(
      PropTypes.shape({
        column: PropTypes.string.isRequired,
        render: PropTypes.func.isRequired,
      }),
    ),
    rowActions: PropTypes.arrayOf(
      PropTypes.shape({
        icon: PropTypes.oneOf(Object.values(BUTTON_ICONS)),
        title: PropTypes.string,
        onClick: PropTypes.func.isRequired,
      }),
    ),
    onRowClick: PropTypes.func,
    headers: PropTypes.arrayOf(PropTypes.string),
    columns: PropTypes.arrayOf(PropTypes.string),
    searchPlaceholder: PropTypes.string,
    onCreateClick: PropTypes.func,
    variant: PropTypes.oneOf(Object.values(ADMIN_TABLE_VARIANTS)),
    centerColumnIndexes: PropTypes.arrayOf(PropTypes.number),
    initialIndex: PropTypes.number,
    searchFilterKey: PropTypes.string.isRequired,
    clients: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)),

    // from store
    filterClientId: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    searchFilterValues: PropTypes.objectOf(PropTypes.string).isRequired,
    isPaginated: PropTypes.bool,
    pageCount: PropTypes.number,
    nextPageNo: PropTypes.number,
    prevPageNo: PropTypes.number,
    fetchAction: PropTypes.func,
    incidentTable: PropTypes.bool,
    isSearchDisplay: PropTypes.bool,
    filterYear: PropTypes.string.isRequired,
    filterMonth: PropTypes.string.isRequired,
    isDateFilterDisplay: PropTypes.bool,
    months: PropTypes.array,
    years: PropTypes.array,
  }

  constructor(props) {
    super(props)
    this.state = {
      currentPage: 0,
      selectedRowIds: [],
      initialIndexLoaded: false,
      calculatedRowPerPage: 0,
      paginatedSearchTerm: '',
    }

    this.adminTableBodyRef = React.createRef()
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.initialIndex &&
      state.currentPage === 0 &&
      props.data.length > 0 &&
      state.initialIndexLoaded === false &&
      state.calculatedRowPerPage
    ) {
      return {
        currentPage: Math.floor(
          props.initialIndex / state.calculatedRowPerPage,
        ),
        initialIndexLoaded: true,
      }
    }
    return null
  }

  componentDidMount() {
    const height = this.adminTableBodyRef.current.offsetHeight

    const calculatedRowPerPage = Math.floor((height - 59) / 56)

    // this is ok
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ calculatedRowPerPage })
  }

  componentDidUpdate(prevProps, { currentPage }) {
    const { data } = this.props
    if (data.length < prevProps.data.length && currentPage > this.maxPage) {
      this.goToPage(this.maxPage)
    }
  }

  onFilterChange = value => {
    const { isPaginated, dispatch } = this.props
    if (!isPaginated) {
      dispatch(updateFilterClientId(value))
    } else {
      const { fetchAction } = this.props
      dispatch(fetchAction(1, value, '', 10))
      dispatch(updateFilterClientId(value))
    }
    this.setState({ currentPage: 0, selectedRowIds: [] })
  }

  onSearch = value => {
    this.props.dispatch(updateFilterValue(this.props.searchFilterKey, value))
    this.setState({ currentPage: 0, selectedRowIds: [] })
  }

  onPaginatedSearch = async value => {
    const {
      filterClientId,
      fetchAction,
      searchFilterValues,
      dispatch,
    } = this.props

    await dispatch(updateFilterValue(this.props.searchFilterKey, value))
    await dispatch(fetchAction(1, filterClientId, searchFilterValues, 10))
  }

  get searchTerm() {
    return this.props.searchFilterValues[this.props.searchFilterKey] || ''
  }

  onYearChange = year => {
    const { dispatch } = this.props
    dispatch(updateFilterYear(year))
    this.setState({ currentPage: 0, selectedRowIds: [] })
  }
  onMonthChange = month => {
    const { dispatch } = this.props
    dispatch(updateFilterMonth(month))
    this.setState({ currentPage: 0, selectedRowIds: [] })
  }

  getFilteredData() {
    const {
      data,
      columns,
      clients,
      filterClientId,
      filterMonth,
      filterYear,
    } = this.props

    const searchRegex = new RegExp(this.searchTerm.replace(/\s+/g, '.*'), 'i')

    let filteredData = [...data]

    // custom filter
    if (filterClientId && clients) {
      filteredData = filteredData.filter(row => row.clientId === filterClientId)
    }
    if (filterYear) {
      filteredData = filteredData.filter(
        row => moment(row.startDate, 'DD/MM/YYYY').year() == filterYear,
      )
    }
    if (filterMonth) {
      filteredData = filteredData.filter(
        row => moment(row.startDate, 'DD/MM/YYYY').month() + 1 == filterMonth,
      )
    }
    if (!this.props.isPaginated) {
      return filteredData.filter(row =>
        columns
          .map(column => searchRegex.test(row[column]))
          .some(fitSearch => fitSearch === true),
      )
    } else {
      return filteredData
    }
  }

  getClientsData() {
    const { clients } = this.props

    if (!clients) {
      return null
    }

    return clients.map(client => ({
      value: client.object_id,
      text: client.name,
    }))
  }

  get maxPage() {
    const { isPaginated } = this.props
    if (!isPaginated) {
      return (
        Math.ceil(
          this.getFilteredData().length / this.state.calculatedRowPerPage,
        ) - 1
      )
    } else {
      return this.props.pageCount
    }
  }

  getPageData(filteredData) {
    const { isPaginated } = this.props
    const { currentPage, calculatedRowPerPage } = this.state

    if (!isPaginated) {
      return filteredData.slice(
        currentPage * calculatedRowPerPage,
        (currentPage + 1) * calculatedRowPerPage,
      )
    } else {
      return filteredData
    }
  }

  getSelectedRows() {
    const { data } = this.props
    const { selectedRowIds } = this.state
    return data.filter(row => selectedRowIds.includes(row.id))
  }

  goToPage(page) {
    if (page < 0 || page > this.maxPage) return

    this.setState({ currentPage: page })
  }

  goToSelectedPage(page) {
    const { isPaginated, dispatch, filterClientId, fetchAction } = this.props
    if (isPaginated) {
      dispatch(fetchAction(page + 1, filterClientId, '', 10))
    } else {
      this.goToPage(page)
    }
    this.setState({ currentPage: page })
  }

  goToPreviousPage() {
    const {
      isPaginated,
      prevPageNo,
      dispatch,
      fetchAction,
      filterClientId,
    } = this.props

    if (isPaginated) {
      dispatch(fetchAction(prevPageNo, filterClientId, '', 10))
      this.goToPage(prevPageNo - 1)
    } else {
      this.goToPage(this.state.currentPage - 1)
    }
  }

  goToNextPage() {
    const {
      isPaginated,
      nextPageNo,
      dispatch,
      fetchAction,
      filterClientId,
    } = this.props

    if (isPaginated) {
      dispatch(fetchAction(nextPageNo, filterClientId, '', 10))
      this.goToPage(nextPageNo - 1)
    } else {
      this.goToPage(this.state.currentPage + 1)
    }
  }

  handleCheckbox(rowId, checked) {
    const { selectedRowIds } = this.state

    if (checked) {
      this.setState({ selectedRowIds: [...selectedRowIds, rowId] })
    } else {
      this.setState({
        selectedRowIds: selectedRowIds.filter(id => id !== rowId),
      })
    }
  }

  handleAllCheckbox(checked) {
    const { selectedRowIds } = this.state
    const paginatedData = this.getPageData(this.getFilteredData())
    const paginatedIds = paginatedData.map(({ id }) => id)
    const stillSelectedIds = selectedRowIds.filter(
      rowId => !paginatedIds.includes(rowId),
    )

    if (checked) {
      this.setState({ selectedRowIds: [...selectedRowIds, ...paginatedIds] })
    } else {
      this.setState({ selectedRowIds: stillSelectedIds })
    }
  }

  render() {
    const {
      headers,
      columns,
      rowActions,
      onRowClick,
      customRenders,
      globalActions,
      searchPlaceholder,
      onCreateClick,
      variant,
      centerColumnIndexes,
      isPaginated,
      pageCount,
      filterClientId,
      incidentTable,
      isSearchDisplay,
      isDateFilterDisplay,
      filterMonth,
      filterYear,
    } = this.props
    const { currentPage, selectedRowIds, calculatedRowPerPage } = this.state

    const filteredData = this.getFilteredData()
    const paginatedData = this.getPageData(filteredData)

    return (
      <div className={`admin-table admin-table--${variant}`}>
        {/* <AdminTableHeader
          onCreateClick={onCreateClick}
          globalActions={globalActions}
          searchPlaceholder={searchPlaceholder}
          selectedRowIds={selectedRowIds}
          search={this.searchTerm}
          selectedFilter={filterClientId}
          selectedRows={this.getSelectedRows()}
          afterGlobalAction={() => this.setState({ selectedRowIds: [] })}
          onSearch={
            this.props.isPaginated ? this.onPaginatedSearch : this.onSearch
          }
          clientsData={this.getClientsData()}
          onFilterChange={this.onFilterChange}
          hasRowsSelected={selectedRowIds.length !== 0}
        /> */}
        <div className="admin-table__header">
          {!incidentTable && (
            <AdminTableHeader
              onCreateClick={onCreateClick}
              globalActions={globalActions}
              searchPlaceholder={searchPlaceholder}
              selectedRowIds={selectedRowIds}
              search={this.searchTerm}
              isSearchDisplay={isSearchDisplay}
              selectedFilter={filterClientId}
              selectedRows={this.getSelectedRows()}
              afterGlobalAction={() => this.setState({ selectedRowIds: [] })}
              onSearch={
                this.props.isPaginated ? this.onPaginatedSearch : this.onSearch
              }
              clientsData={this.getClientsData()}
              onFilterChange={this.onFilterChange}
              hasRowsSelected={selectedRowIds.length !== 0}
              incidentTable={incidentTable}
            />
          )}
          {isDateFilterDisplay && (
            <div className="admin-table__header">
              <Selector
                value={filterMonth}
                label="Months"
                onChange={this.onMonthChange}
                data={this.props.months}
              />
              <Selector
                value={filterYear}
                label="Years"
                onChange={this.onYearChange}
                data={this.props.years}
              />
            </div>
          )}
        </div>
        {globalActions.length > 0 && (
          <AdminTableSelectionPanel selectedRowIds={selectedRowIds} />
        )}
        <AdminTableBody
          ref={this.adminTableBodyRef}
          rowPerPage={calculatedRowPerPage}
          globalActions={globalActions}
          selectedRowIds={selectedRowIds}
          headers={headers}
          incidentTable={incidentTable}
          onOrderChange={incidentTable ? false : true}
          rowActions={rowActions}
          columns={columns}
          customRenders={customRenders}
          onRowClick={onRowClick}
          currentPage={currentPage}
          onAllCheckboxChange={value => this.handleAllCheckbox(value)}
          onRowCheckboxChange={(row, value) =>
            this.handleCheckbox(row.id, value)
          }
          showCheckboxes={globalActions.length > 0}
          data={paginatedData}
          centerColumnIndexes={centerColumnIndexes}
        />
        {!incidentTable && (
          <AdminTableFooter
            currentPage={currentPage}
            totalPageCount={
              !isPaginated
                ? calculatedRowPerPage
                  ? Math.max(
                      Math.ceil(filteredData.length / calculatedRowPerPage),
                      1,
                    )
                  : 1
                : pageCount
            }
            onPreviousPageClick={() => this.goToPreviousPage()}
            onNextPageClick={() => this.goToNextPage()}
            onPageClick={page => this.goToSelectedPage(page)}
          />
        )}
      </div>
    )
  }
}

AdminTable.defaultProps = {
  onRowClick: null,
  data: [],
  headers: [],
  columns: [],
  customRenders: [],
  globalActions: [],
  rowActions: [],
  searchPlaceholder: '',
  onCreateClick: null,
  variant: ADMIN_TABLE_VARIANTS.Contained,
  centerColumnIndexes: [],
  initialIndex: 0,
  clients: null,
  isPaginated: false,
  pageCount: null,
  nextPageNo: null,
  prevPageNo: null,
  incidentTable: false,
  fetchAction: () => {},
  isSearchDisplay: true,
  isDateFilterDisplay: false,
  years: null,
  months: [
    { value: 1, text: 'January' },
    { value: 3, text: 'February' },
    { value: 2, text: 'March' },
    { value: 4, text: 'April' },
    { value: 5, text: 'May' },
    { value: 6, text: 'June' },
    { value: 7, text: 'July' },
    { value: 8, text: 'August' },
    { value: 9, text: 'September' },
    { value: 10, text: 'October' },
    { value: 11, text: 'November' },
    { value: 12, text: 'December' },
  ],
}

export default connect(state => ({
  filterClientId: state.admin.filterClientId,
  searchFilterValues: state.admin.filterValues,
  filterYear: state.admin.filterYear,
  filterMonth: state.admin.filterMonth,
}))(AdminTable)
