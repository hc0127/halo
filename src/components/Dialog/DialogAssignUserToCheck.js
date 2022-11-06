import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import DashboardButton from '../DashboardButton'
import { VARIANT } from '../../utils/constants'
import Parse from 'parse'
import SelectMembers from '../common/SelectMembers/SelectMembers'

import { connect } from 'react-redux'

const propTypes = {
  onClose: PropTypes.func.isRequired,
  check: PropTypes.instanceOf(Parse.Object).isRequired,
  geofences: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  staffGroups: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  staff: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  assignUsers: PropTypes.func.isRequired,
  isAddingAssignees: PropTypes.bool.isRequired,
}

const DialogAssignUserToCheck = ({
  onClose,
  check,
  geofences,
  staffGroups,
  staff,
  assignUsers,
  isAddingAssignees,
}) => {
  const [selectedUserIds, setSelectedUserIds] = useState(check.users || [])

  useEffect(() => {
    if (isAddingAssignees === false) {
      onClose()
    }
  }, [isAddingAssignees, onClose])

  return (
    <div className="dialog--assign-user-to-check">
      <h2>Assign Task</h2>
      <p>Search and select people to add to this task</p>

      <SelectMembers
        onChange={setSelectedUserIds}
        selected={selectedUserIds}
        geofences={geofences}
        staffGroups={staffGroups}
        staff={staff}
      />

      <div className="dialog__button-bar">
        <DashboardButton onClick={onClose} variant={VARIANT.Secondary}>
          Cancel
        </DashboardButton>
        <DashboardButton
          onClick={() => {
            if (!selectedUserIds.length) {
              return
            }

            assignUsers(selectedUserIds)
          }}
          disabled={!selectedUserIds.length}
        >
          {isAddingAssignees ? 'Updating...' : 'Assign task'}
        </DashboardButton>
      </div>
    </div>
  )
}

DialogAssignUserToCheck.propTypes = propTypes

DialogAssignUserToCheck.defaultProps = {}

export default connect(state => ({
  isAddingAssignees: state.eventChecks.isAddingAssignees,
}))(DialogAssignUserToCheck)
