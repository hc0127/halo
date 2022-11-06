import React, { createRef, PureComponent } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import moment from 'moment'
import utils, { getAllTicketLogs } from '../../utils/helpers'

import { Panel } from '../../components/common'
import Loading from '../../components/common/Loading/Loading'
import {
  cacheEventId,
  reloadEvent,
} from '../../stores/ReduxStores/dashboard/currentEvent'
import ReportTicketScanningTable from '../../components/ReportTicketScanningStaffTable/ReportTicketScanningTable'
import { loadTicketScanningLogs } from '../../stores/ReduxStores/dashboard/ticketScanningLogs'
import { loadStaff } from '../../stores/ReduxStores/dashboard/staff'
import TotalEntries from '../../components/ReportTicketScanning/TicketTotalEntries'
import CapacityOverview from '../../components/ReportTicketScanning/CapacityOverview'
import EntriesOverTime from '../../components/ReportTicketScanning/TicketScansOverTime'
import CsvBuilder from '../../utils/CsvBuilder'
import DashboardButton from '../../components/DashboardButton'

class TicketScanningReportPage extends PureComponent {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string.isRequired,
      }),
    }).isRequired,
    ticketScanningLogs: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object))
      .isRequired,
    eventAws:PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    event: PropTypes.instanceOf(Parse.Object),
    staff: PropTypes.object.isRequired,
    count: PropTypes.number.isRequired,
  }

  static defaultProps = {
    event: null,
  }
  
  constructor() {
    super()
    this.state = {
      chartFilters: [
        {
          label: 'Today',
          value: 'today',
        },
        {
          label: 'Event',
          value: 'event',
        },
        {
          label: 'Last 15 Minutes',
          value: 'lastFifteen',
        },
      ],
      chartFilterBy: 'today',
      isGeneratingCSV: false,
    }

    this.reportRef = createRef()
    this.eventListenerSet = false
    this.intervalId = setInterval(() => {
      this.props.dispatch(reloadEvent(this.props.match.params.id))
      this.props.dispatch(loadTicketScanningLogs())
    }, 5000)
  }

  componentDidMount() {
    const {
      props: {
        match: {
          params: { id: eventId },
        },
      },
    } = this

    this.props.dispatch(cacheEventId(eventId))
    this.props.dispatch(loadStaff())
  }

  componentWillUnmount() {
    clearTimeout(this.intervalId)
  }

  graphFilterHandler = event => {
    this.setState({ chartFilterBy: event.target.value })
  }

  downloadTicketScanningDataHandler = async () => {
    const {
      props: {
        count,
        match: {
          params: { id: eventId },
        },
      },
    } = this

    this.setState({ isGeneratingCSV: true })

    
    const totalScans = await getAllTicketLogs(count, eventId)

    this.setState({ isGeneratingCSV: false })

    // build and download the csv
    const csvBuilder = new CsvBuilder()

    csvBuilder
      .setHeader(['Ticket', 'User', 'Result', 'Scan Time'])
      .setBody(this.ticketScanningCsvData(totalScans))

    const fileName = this.props.event.event_code
      ? this.props.event.event_code
      : this.props.event.title

    utils.downloadFile(csvBuilder.build(), fileName)
  }

  ticketScanningCsvData = totalScans => {
    let ticket=[]
    totalScans && totalScans.forEach(log => {
      log.logs && log.logs.forEach(item => {
        item.code = log.code;
        item.result=log.result;
        ticket.push(item)
      })
      
    })
    return ticket.map(scan => {
      

      let userName=this.props.eventAws?.filter(name => name.user_id==scan?.updated_by)[0]?.usernames
      return [
        scan?.code,
        this.props.eventAws?.filter(name => name.user_id==scan?.updated_by)[0]?.username??"staff",
        scan?.status,
        moment(scan.updated_at).format('DD/MM/YYYY HH:mm:ss'),
      ]
    })
  }

  render() {
    const { isGeneratingCSV } = this.state
    const { loading, event, ticketScanningLogs, count,eventAws } = this.props

    if (loading) {
      return (
        <div className="ReportContainer">
          <Loading centered />
        </div>
      )
    }
    return (
      <div className="ReportContainer report-ticket-scanning-container">
        <div className="ticket-scanning-report-inner">
          <Panel height="100%" orientation="column">
            <div className="SectionTitle">Ticket Scanning</div>
            <div className="report-ticket-scanning-container__csv-download">
              <DashboardButton
                type="primary"
                onClick={() => {
                  this.downloadTicketScanningDataHandler()
                }}
                disabled={isGeneratingCSV}
              >
                {isGeneratingCSV ? 'Generating...' : 'CSV Export'}
              </DashboardButton>
            </div>
            <div className="report-ticket-scanning-container__data-container">
              <div className="report-ticket-scanning-container__data-container--chart-data">
                <TotalEntries totalEntries={count} />
                <CapacityOverview />

                <EntriesOverTime
                  filters={this.state.chartFilters}
                  ticketScanningLogs={ticketScanningLogs}
                  chartFilterBy={this.state.chartFilterBy}
                  onFilter={this.graphFilterHandler}
                />
              </div>
              <div className="report-ticket-scanning-container__data-container--staff-data">
                <ReportTicketScanningTable
                  count={count}
                  eventAws={eventAws}
                  eventId={event.object_id}
                  staff={this.props.staff}
                />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  ticketScanningLogs: state.ticketScanningLogs.data,
  count: state.ticketScanningLogs.count,
  eventAws:state.currentEvent.eventAws,
  staff: state.staff.data,
  event: state.currentEvent.event,
  loading:
    state.currentEvent.status === 'loading' ||
    state.staff.status === 'loading' ||
    state.ticketScanningLogs.status === 'loading',
}))(TicketScanningReportPage)
