import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import { connect } from 'react-redux'
import { compose } from 'redux'

import Title from '../common/Title/Title'
import NiceCheckbox from '../AdminTable/NiceCheckbox'
import { shareIncidentAction } from '../../stores/ReduxStores/dashboard/incidents'
import { Loading, Button } from '../../components/common'
import { closeDialog } from '../../stores/ReduxStores/dashboard/dashboard'
import DashboardButton from '../DashboardButton'
import { VARIANT, USER_PERMISSIONS } from '../../utils/constants'
import TagInput from '../TagInput/TagInput'
import utils from '../../utils/helpers'
import SelectMembers from '../common/SelectMembers/SelectMembers'
import dashboardUtils from '../../utils/dashboardFilterHelpers'

// not in constants.js because it's local to this file.
const DIALOG_STAGES = {
  UserSelection: 'user-selection',
  Confirmation: 'confirmation',
}

class DialogShareIncident extends Component {
  static propTypes = {
    staff: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    geofences: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
    staffGroups: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object))
      .isRequired,
    dispatch: PropTypes.func.isRequired,
    incident: PropTypes.instanceOf(Parse.Object).isRequired,
    suggestedTags: PropTypes.array,
  }
  static defaultProps = {
    suggestedTags: [],
  }

  constructor(props) {
    super(props)
    this.state = {
      searchString: '',
      selectedUserIds: [],
      tags: props.incident.tags || [],
      stage: DIALOG_STAGES.UserSelection,
      loaded: false,
      saving: false,
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.loaded && props.incident) {
      const selectedUserIds = props.incident.triaging_allowed_users.map(
        userId => userId,
      )
      return { loaded: true, selectedUserIds }
    }
    return null
  }

  get selectedStaff() {
    const { staff } = this.props
    const { selectedUserIds } = this.state

    return staff.filter(({ object_id }) => selectedUserIds.includes(object_id))
  }

  setTags(tags) {
    this.setState({ tags })
  }

  shareIncident() {
    this.setState({ saving: true })
    this.props.dispatch(
      shareIncidentAction(
        this.props.incident,
        this.selectedStaff.map(({ object_id }) => object_id),
        this.state.tags,
      ),
    )
  }

  render() {
    const {
      incident,
      dispatch,
      suggestedTags,
      geofences,
      staff,
      staffGroups,
    } = this.props
    const { stage, saving, tags, selectedUserIds } = this.state

    const showTags = !incident.triaged

    if (!incident) return <Loading />

    return (
      <div
        className={`dialog dialog-share-incident dialog-share-incident--${stage}`}
      >
        <Button type="invisible" onClick={() => dispatch(closeDialog())}>
          &times;
        </Button>
        {stage === DIALOG_STAGES.UserSelection && (
          <>
            <Title type="h3">Share Incident {incident.incident_code}</Title>
            <div>
              Search by members, groups, or locations and select the members to
              share this incident with
            </div>

            <SelectMembers
              onChange={selectedUserIds => this.setState({ selectedUserIds })}
              geofences={geofences}
              staffGroups={staffGroups}
              staff={staff}
              selected={selectedUserIds}
            />

            {showTags && (
              <>
                <hr />
                <div className="dialog-share-incident__add-tags">
                  <Title type="h4" variant={VARIANT.Secondary}>
                    Tags:
                  </Title>
                  <TagInput
                    onChange={newTags => this.setTags(newTags)}
                    suggestedTags={suggestedTags}
                    tags={tags}
                  />
                </div>
              </>
            )}
            <div className="button-container">
              <DashboardButton
                onClick={() =>
                  this.setState({ stage: DIALOG_STAGES.Confirmation })
                }
              >
                Share Incident
              </DashboardButton>
            </div>
          </>
        )}
        {stage === DIALOG_STAGES.Confirmation && (
          <>
            <Title type="h3">Confirm incident sharing</Title>
            <div>
              Share incident with the following {this.selectedStaff.length}{' '}
              members:
            </div>
            <ul className="dialog-share-incident__select-users">
              {this.selectedStaff.map(user => (
                <li key={user.id}>
                  <NiceCheckbox
                    onChange={() =>
                      this.setState({
                        selectedUserIds: this.state.selectedUserIds.filter(
                          id => id !== user.id,
                        ),
                      })
                    }
                    checked
                  />
                  <span className="dialog-share-incident__select-users__name">
                    {user.name}
                  </span>
                </li>
              ))}
            </ul>

            {showTags && (
              <>
                <hr />
                <div className="dialog-share-incident__add-tags">
                  <Title type="h4" variant={VARIANT.Secondary}>
                    Tags:
                  </Title>
                  {tags.length ? <TagInput tags={tags} disabled /> : 'None'}
                </div>
              </>
            )}
            <div className="button-container">
              <DashboardButton
                onClick={() => this.shareIncident()}
                loading={saving}
              >
                Confirm
              </DashboardButton>
              <DashboardButton
                onClick={() =>
                  this.setState({ stage: DIALOG_STAGES.UserSelection })
                }
              >
                Back
              </DashboardButton>
            </div>
          </>
        )}
      </div>
    )
  }
}

export default compose(
  connect((state, props) => {
    return {
      incident: state.incidents.data[props.incidentId]
        ? state.incidents.data[props.incidentId]
        : state.incidents.closedIncidentList.filter(
            incident => incident.id === props.incidentId,
          )[0],
      suggestedTags: [
        ...new Set(
          utils
            .flattenArray(
              Object.values(state.incidents.data).map(
                incident => incident.tags,
              ),
            )
            .filter(tag => tag !== undefined)
            .filter(tag => tag !== null),
        ),
      ],
      staff:
        state.auth.currentUser.permission_role ===
        USER_PERMISSIONS.TargetedDashboardUser
          ? [
              ...new Set([
                ...Object.values(state.staff.data).filter(
                  user => user.permission_role !== USER_PERMISSIONS.NormalUser,
                ),
                ...dashboardUtils.filterStaffByUserGroups(
                  state.staffGroups.list,
                  Object.values(state.staff.data),
                ),
              ]),
            ]
          : Object.values(state.staff.data),
      geofences: state.eventGeofences.list,
      staffGroups: state.staffGroups.list,
    }
  }),
)(DialogShareIncident)
