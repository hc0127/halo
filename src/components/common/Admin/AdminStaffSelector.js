import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { AdminCard, AdminCardBody } from '.'
import { BUTTON_ICONS, VARIANT } from '../../../utils/constants'
import ButtonWithIcon from '../ButtonWithIcon'
import { AdminTableHeader, AdminTableBody } from '../../AdminTable'

class AdminStaffSelector extends Component {
  static propTypes = {
    users: PropTypes.arrayOf(PropTypes.object).isRequired,
    eventUserIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
    shiftManagerId: PropTypes.string,
    onShiftManagerChanged: PropTypes.func,
    onStaffCreateClick: PropTypes.func,
    onStaffEditClick: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    staffCounts: PropTypes.object.isRequired,
  }

  static defaultProps = {
    onShiftManagerChanged: null,
    shiftManagerId: null,
    onStaffCreateClick: () => {},
  }

  constructor(props) {
    super(props)
    this.state = {
      userSearch: '',
      selectedClientUserIds: [],
      selectedEventUserIds: [],
    }
  }

  get filteredUsers() {
    const { userSearch } = this.state
    const { users, eventUserIds } = this.props

    return (
      users
        // filter by search input
        .filter(user =>
          user.name.toLowerCase().includes(userSearch.toLowerCase()),
        )
        // filter by unselected user
        .filter(user => !eventUserIds.includes(user.object_id))
    )
  }

  getNewCheckboxList = (userIds, userId, value) => {
    if (value) {
      return [...userIds, userId]
    }
    return userIds.filter(id => id !== userId)
  }

  handleUserCreated(userId) {
    this.props.onChange([...this.props.eventUserIds, userId])
  }

  getHeaders() {
    const { onShiftManagerChanged, shiftManagerId } = this.props
    if (onShiftManagerChanged || shiftManagerId) {
      return ['Person', 'Role', 'Shift Manager']
    } else {
      return ['Person', 'Role']
    }
  }

  getColumns() {
    const { onShiftManagerChanged, shiftManagerId } = this.props
    if (onShiftManagerChanged || shiftManagerId) {
      return ['name', 'role', 'shiftManager']
    } else {
      return ['name', 'role']
    }
  }

  render() {
    const {
      onStaffCreateClick,
      onStaffEditClick,
      users,
      eventUserIds,
      onChange,
      shiftManagerId,
      onShiftManagerChanged,
    } = this.props
    const {
      userSearch,
      selectedClientUserIds,
      selectedEventUserIds,
    } = this.state

    const eventUsers = users.filter(
      user =>
        eventUserIds.includes(user.object_id) &&
        user.name.toLowerCase().includes(userSearch.toLowerCase()),
    )

    const clientUserIds = this.filteredUsers.map(user => user.object_id)

    return (
      <div className="admin-staff-selector">
        <AdminCard title="People">
          <AdminCardBody nopadding>
            <AdminTableHeader
              onCreateClick={
                onStaffCreateClick
                  ? () => onStaffCreateClick(id => this.handleUserCreated(id))
                  : null
              }
              searchPlaceholder="Search people"
              search={userSearch}
              onSearch={value => this.setState({ userSearch: value })}
            />
            <AdminTableBody
              headers={['Person', 'Role']}
              columns={['name', 'role']}
              customRenders={[]}
              onRowClick={row => onStaffEditClick(row.id)}
              selectedRowIds={selectedClientUserIds}
              onAllCheckboxChange={value =>
                this.setState({
                  selectedClientUserIds: value ? [...clientUserIds] : [],
                })
              }
              onRowCheckboxChange={(row, value) =>
                this.setState({
                  selectedClientUserIds: this.getNewCheckboxList(
                    selectedClientUserIds,
                    row.id,
                    value,
                  ),
                })
              }
              showCheckboxes
              data={this.filteredUsers.map(user => ({
                id: user.object_id,
                name: user.name,
                role: user.role,
              }))}
            />
          </AdminCardBody>
        </AdminCard>
        <div>
          <ButtonWithIcon
            icon={BUTTON_ICONS.RightArrow}
            wide
            onClick={() => {
              this.setState({
                selectedClientUserIds: [],
              })
              onChange([...eventUserIds, ...selectedClientUserIds])
            }}
          />
          <ButtonWithIcon
            icon={BUTTON_ICONS.LeftArrow}
            wide
            onClick={() => {
              this.setState({
                selectedEventUserIds: [],
              })
              onChange(
                eventUserIds.filter(
                  eventUserId => !selectedEventUserIds.includes(eventUserId),
                ),
              )
            }}
          />
        </div>
        <AdminCard title="People assigned to event">
          <AdminCardBody nopadding>
            <div style={{ height: 40, marginBottom: 18 }} />
            <AdminTableBody
              {...{
                headers: this.getHeaders(),
                columns: this.getColumns(),
                customRenders: [
                  {
                    column: 'shiftManager',
                    render: row => (
                      <ButtonWithIcon
                        icon={BUTTON_ICONS.ShiftManager}
                        onClick={e => {
                          e.stopPropagation()
                          onShiftManagerChanged(row.id)
                        }}
                        variant={VARIANT.NoBackground}
                        selected={row.isShiftManager}
                      />
                    ),
                  },
                ],
                selectedRowIds: selectedEventUserIds,
                onAllCheckboxChange: value =>
                  this.setState({
                    selectedEventUserIds: value ? [...eventUserIds] : [],
                  }),
                onRowCheckboxChange: (row, value) =>
                  this.setState({
                    selectedEventUserIds: this.getNewCheckboxList(
                      selectedEventUserIds,
                      row.id,
                      value,
                    ),
                  }),
                showCheckboxes: true,
                data: eventUsers.map(user => ({
                  id: user.object_id,
                  name: user.name,
                  role: user.role,
                  isShiftManager: user.object_id === shiftManagerId,
                })),
              }}
              onRowClick={row => onStaffEditClick(row.id)}
              centerColumnIndexes={[2]}
            />
          </AdminCardBody>
        </AdminCard>
      </div>
    )
  }
}

export default AdminStaffSelector
