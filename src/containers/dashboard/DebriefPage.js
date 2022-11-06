import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import { Panel, PopupView, Button } from '../../components/common'
import Heading from '../../components/common/Heading/Heading'
import Loading from '../../components/common/Loading/Loading'
import crest from '../../images/crest.png'
import ReportIncidents from '../../components/ReportIncidentList/ReportIncidents'
import utils from '../../utils/helpers'
import { cacheEventId } from '../../stores/ReduxStores/dashboard/currentEvent'
import {
  loadIncidents,
  loadClosedIncidents,
} from '../../stores/ReduxStores/dashboard/incidents'
import {
  DashboardSlidingPanel,
  DashboardDialogPanel,
} from '../../components/Dashboard'
import { USER_PERMISSIONS } from '../../utils/constants'
import { loadStaffGroups } from '../../stores/ReduxStores/dashboard/staffGroups'
import dashboardUtils from '../../utils/dashboardFilterHelpers'

class DebriefPage extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({ id: PropTypes.string.isRequired }),
    }).isRequired,
    incidents: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    event: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    staffGroups: PropTypes.array.isRequired,
  }

  static defaultProps = {}

  constructor() {
    super()
    this.state = {
      popupViewOpen: false,
    }
  }

  componentDidMount() {
    this.props.dispatch(cacheEventId(this.props.match.params.id))
    this.props.dispatch(loadIncidents())
    this.props.dispatch(loadClosedIncidents())
    this.props.dispatch(loadStaffGroups())
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
          <Button
            type="outline"
            onClick={() =>
              this.setState({ popupViewOpen: !this.state.popupViewOpen })
            }
          >
            <span> Cancel </span>
          </Button>
          <Button
            type="primary"
            size="md"
            onClick={() => {
              this.setState({ popupViewOpen: !this.state.popupViewOpen })
              window.print()
            }}
          >
            <span>Print</span>
          </Button>
        </div>
      </div>
    )
  }

  render() {
    const { incidents, loading, event, staffGroups } = this.props
    const { currentUser } = this.props

    if (loading) {
      return <Loading />
    }
    const debriefIncidents = incidents.filter(({ debrief }) => debrief)

    const filteredIncidents =
      currentUser.permission_role === USER_PERMISSIONS.TargetedDashboardUser
        ? [
          ...dashboardUtils.filterIncidentsByUserGroups(
            staffGroups,
            debriefIncidents,
          ),
        ]
        : debriefIncidents

    const dateShown = utils.formatEventDate(event)

    return (
      <>
        <DashboardSlidingPanel />
        <DashboardDialogPanel />
        <div className="ReportContainer">
          <Panel height="100%" orientation="column">
            <div>
              <div className="PrintContainer">
                <div className="ReportTitle">
                  <img className="report-logo" src={crest} alt="logo" />
                  <Heading
                    size="h4"
                    className="report-brand"
                    text="HALO - Debrief"
                  />
                  <table className="Heading">
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
                <div className="SectionTitle">
                  <div className="clearfix">
                    <div className="float-left">
                      <Heading size="h3" text="Incidents" />
                    </div>
                    <div className="float-right">
                      Total Incidents: {filteredIncidents.length}
                    </div>
                  </div>
                </div>
                <div className="IncidentTableContainer">
                  <ReportIncidents incidents={filteredIncidents} />
                </div>
              </div>
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

export default connect(state => ({
  currentUser: state.auth.currentUser,
  incidents: Object.values(state.incidents.data).concat(
    state.incidents.closedIncidentList,
  ),
  event: state.currentEvent.event,
  loading: state.incidents.status === 'loading',
  staffGroups: state.staffGroups.list,
}))(DebriefPage)
