import React, { createRef, PureComponent } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import {
  DashboardSlidingPanel,
  DashboardDialogPanel,
} from '../../components/Dashboard'
import { Panel, PopupView, Button } from '../../components/common'
import Heading from '../../components/common/Heading/Heading'
import Loading from '../../components/common/Loading/Loading'
import crest from '../../images/crest.png'
import ReportIncidents from '../../components/ReportIncidentList/ReportIncidents'
import ReportPieChart from '../../components/ReportGraphs/ReportPieChart/ReportPieChart'
import ReportLineGraph from '../../components/ReportGraphs/ReportLineGraph/ReportLineGraph'
import ActivityLogs from '../../components/ReportActivityLogs/ReportActivityLogs'
import utils from '../../utils/helpers'
import { cacheEventId } from '../../stores/ReduxStores/dashboard/currentEvent'
import {
  loadIncidents,
  loadClosedIncidents,
} from '../../stores/ReduxStores/dashboard/incidents'
import { loadStaffGroups } from '../../stores/ReduxStores/dashboard/staffGroups'
import { loadLogs, clearLogs } from '../../stores/ReduxStores/dashboard/logs'
import TicketScanningLineGraph from '../../components/ReportGraphs/TicketScanningLineGraph/TicketScanningLineGraph'
import dashboardUtils from '../../utils/dashboardFilterHelpers'
import { USER_PERMISSIONS } from '../../utils/constants'

const SectionTitle = props => (
  <div className="SectionTitle">{props.children}</div>
)

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
}
class ReportPage extends PureComponent {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({ id: PropTypes.string.isRequired }),
    }).isRequired,
    incidents: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    logs: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    event: PropTypes.instanceOf(Parse.Object),
    customIncidentTypes: PropTypes.array.isRequired,
  }

  static defaultProps = {
    event: null,
  }

  constructor() {
    super()
    this.state = {
      downloadPending: false,
      loadingActivityLogs: false,
      activityLogsLoaded: false,
      popupViewOpen: false,
    }

    this.reportRef = createRef()
    this.eventListenerSet = false
  }

  componentDidMount() {
    this.props.dispatch(cacheEventId(this.props.match.params.id))
    this.props.dispatch(loadIncidents())
    this.props.dispatch(loadClosedIncidents())
    this.props.dispatch(loadStaffGroups())
  }

  componentDidUpdate() {
    if (this.reportRef && this.reportRef.current && !this.eventListenerSet) {
      this.reportRef.current.addEventListener('scroll', this.handleScroll)
      this.handleScroll()
      this.eventListenerSet = true
    }
  }

  componentWillUnmount() {
    this.reportRef.current.removeEventListener('scroll', this.handleScroll)
    this.props.dispatch(clearLogs())
  }

  getPopupContent() {
    return (
      <div className="PopupView__content">
        <div>
          <Heading text="Save as pdf" />
        </div>
        <div>
          <br />
          <b>Chrome</b>
          <p>To save as pdf please set Print Destination to: Save as PDF.</p>
          <b>Firefox</b>
          <p>To save as pdf please set Name as: Microsoft Print to PDF.</p>
          <b>Safari</b>
          <p>
            Please set the dropdown in the bottom left of Print Settings to:
            Save as PDF.
          </p>
        </div>
        <div className="PopupView__button-bar">
          {this.state.loadingActivityLogs && (
            <>
              <h4>Loading activity logs</h4>
              <Loading />
            </>
          )}
          <Button
            type="outline"
            onClick={() =>
              this.setState({ popupViewOpen: !this.state.popupViewOpen })
            }
            disabled={this.state.loadingActivityLogs}
          >
            <span> Cancel </span>
          </Button>
          <Button
            type="primary"
            size="md"
            disabled={this.state.loadingActivityLogs}
            onClick={() => {
              if (this.props.logs.length === 0) {
                this.setState({
                  loadingActivityLogs: true,
                  downloadPending: true,
                })
                this.props.dispatch(
                  loadLogs(() => {
                    this.setState({
                      popupViewOpen: !this.state.popupViewOpen,
                      loadingActivityLogs: false,
                      activityLogsLoaded: true,
                    })
                    this.reportRef.current.removeEventListener(
                      'scroll',
                      this.handleScroll,
                    )
                  }),
                )
              } else {
                // var content = document.getElementById('print');
                // var pri = document.getElementById('ifmcontentstoprint').contentWindow;
                // pri.document.open();
                // pri.document.write(content.innerHTML);

                // // generate CSS links
                // var bootstrap = document.createElement('link');
                // bootstrap.href = '/static/css/bootstrap.css';
                // bootstrap.rel = 'stylesheet';
                // pri.document.head.appendChild(bootstrap);

                // var app = document.createElement('link');
                // app.href = '/static/css/bq_print.css';
                // app.rel = 'stylesheet';
                // pri.document.head.appendChild(app);
                window.print()
              }
            }}
          >
            <span>Save</span>
          </Button>
        </div>
      </div>
    )
  }

  handleScroll = () => {
    const { current: reportContainer } = this.reportRef
    const { dispatch } = this.props
    const { loadingActivityLogs, activityLogsLoaded } = this.state

    if (!loadingActivityLogs && !activityLogsLoaded) {
      if (
        reportContainer.scrollHeight <=
        reportContainer.scrollTop +
          reportContainer.getBoundingClientRect().height
      ) {
        this.setState({ loadingActivityLogs: true })
        dispatch(
          loadLogs(() => {
            this.setState({
              loadingActivityLogs: false,
              activityLogsLoaded: true,
            })
          }),
        )
      }
    }
  }

  handleReportDownload = () => {
    this.setState({ downloadPending: false })
    // var content = document.getElementById('print');
    // var pri = document.getElementById('ifmcontentstoprint').contentWindow;
    // pri.document.open();
    // pri.document.write(content.innerHTML);

    // // generate CSS links
    // var bootstrap = document.createElement('link');
    // bootstrap.href = '/static/css/bootstrap.css';
    // bootstrap.rel = 'stylesheet';
    // pri.document.head.appendChild(bootstrap);

    // var app = document.createElement('link');
    // app.href = '/static/css/bq_print.css';
    // app.rel = 'stylesheet';
    // pri.document.head.appendChild(app);
    window.print()
  }

  render() {
    const { customIncidentTypes, incidents, logs, loading, event } = this.props

    if (loading) {
      return (
        <div className="ReportContainer">
          <Loading centered />
        </div>
      )
    }

    const dateShown = utils.formatEventDate(event)

    const incidentTypes = incidents
      .map(incident => incident.type_value)
      .filter((value, index, array) => array.indexOf(value) === index)

    const incidentCountByType = {
      datasets: [
        {
          data: incidentTypes.map(
            type =>
              incidents.filter(incident => incident.type_value === type).length,
          ),
          backgroundColor: [
            'rgb(23, 36, 117)',
            'rgb(99, 131, 221)',
            'rgb(58,153 , 202)',
            'rgb(123, 209 , 222)',
            'rgb(99, 218, 150)',
            'rgb(194, 220, 156)',
            'rgb(227, 238, 85)',
            'rgb(255, 216, 26)',
            'rgb(223, 182, 38)',
            'rgb(242, 157, 0)',
            'rgb(242, 123, 0)',
          ],
        },
      ],
      labels: incidentTypes.map(
        type => `${utils.getIncidentName(type, customIncidentTypes)}`,
      ),
    }
    return (
      <>
        <DashboardSlidingPanel allowClosedIncident />
        <DashboardDialogPanel />
        <div className="ReportContainer" ref={this.reportRef}>
          <Panel height="100%" orientation="column">
            <div className="PrintContainer">
              <div className="ReportTitle">
                <img className="report-logo" src={crest} alt="logo" />
                <Heading
                  size="h4"
                  className="report-brand"
                  text="HALO - Incident Log"
                />
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td>
                        <Heading
                          size="h1"
                          className="titlePadding"
                          text={event.title}
                        />
                        <Heading size="h4" text={dateShown} />
                      </td>
                      <td>
                        <div className="pullRight">
                          <button
                            onClick={() =>
                              this.setState({
                                popupViewOpen: !this.state.popupViewOpen,
                              })
                            }
                            className="Button Button--primary Button--md form-submit"
                          >
                            <span>Save as PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <SectionTitle>Overview</SectionTitle>
                <Heading
                  size="h3"
                  className="pieHeader"
                  text={`Total Incidents: ${incidents.length}`}
                />
                <ReportPieChart incidentCountByType={incidentCountByType} />
                {utils.hasTicketScanning(event) ? (
                  <div className="">
                    <TicketScanningLineGraph showTitle chartFilterBy="event" />
                  </div>
                ) : (
                  <ReportLineGraph />
                )}
              </div>
              <div>
                <SectionTitle>Incidents</SectionTitle>
                <div className="IncidentTableContainer">
                  <ReportIncidents incidents={incidents} />
                </div>
              </div>
              {this.state.loadingActivityLogs && !this.state.activityLogsLoaded && (
                <div>
                  <Loading />
                </div>
              )}
              {!this.state.loadingActivityLogs && this.state.activityLogsLoaded && (
                <div>
                  <SectionTitle>Activity Logs</SectionTitle>
                  <ActivityLogs
                    logs={logs && utils.sort(logs, log => log.createdAt, 'desc')}
                    downloadPending={this.state.downloadPending}
                    onDownloadReport={this.handleReportDownload}
                  />
                </div>
              )}
            </div>
          </Panel>
          <PopupView
            child={this.getPopupContent()}
            open={this.state.popupViewOpen}
            closePopup={() => this.setState({ popupViewOpen: false })}
          />
        </div>
      </>
    )
  }
}

export default connect(state => {
  const { permission_role } = state.auth.currentUser
  const staffGroups = state.staffGroups.list
  const closedIncidents = utils.sort(
    Object.values(state.incidents.data).concat(
      state.incidents.closedIncidentList,
    ),
    ({ created_at }) => created_at,
    'desc',
  )

  const malIncidents = [
    ...dashboardUtils.filterIncidentsByUserGroups(staffGroups, closedIncidents),
  ]

  return {
    incidents:
      permission_role === USER_PERMISSIONS.TargetedDashboardUser
        ? malIncidents
        : closedIncidents,
    logs: Object.values(state.logs.data),
    customIncidentTypes: state.incidentForm.incidents.filter(form =>
      form.type.startsWith('custom'),
    ),
    event: state.currentEvent.event,
    loading: state.incidents.status === 'loading',
  }
})(ReportPage)
