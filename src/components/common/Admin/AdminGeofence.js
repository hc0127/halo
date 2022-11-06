import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import { AdminField, AdminButton, AdminGeofenceEditor } from '.'
import { VARIANT } from '../../../utils/constants'

class AdminGeofence extends Component {
  static propTypes = {
    onDeleteGeofence: PropTypes.func,
    onAddGeofence: PropTypes.func,
    points: PropTypes.arrayOf(PropTypes.instanceOf(Parse.GeoPoint)).isRequired,
    onGeofenceChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    onNameChange: PropTypes.func.isRequired,
  }
  static defaultProps = {
    onDeleteGeofence: null,
    onAddGeofence: null,
  }

  constructor(props) {
    super(props)
    this.geofenceEditorRef = React.createRef()
  }

  render() {
    const {
      onDeleteGeofence,
      onAddGeofence,
      points,
      onGeofenceChange,
      name,
      onNameChange,
    } = this.props

    return (
      <div className="admin-geofence">
        <AdminGeofenceEditor
          ref={this.geofenceEditorRef}
          geofencePoints={points}
          self={this.geofenceEditorRef.current}
          onChange={onGeofenceChange}
        />

        <div className="admin-geofence__field-and-buttons">
          <AdminField
            label="Geofence name"
            type="text"
            value={name}
            onChange={onNameChange}
            required="Please provide a name for the geofence"
          />
          <AdminButton
            hollow
            onClick={() => this.geofenceEditorRef.current.addMarker()}
          >
            Add Marker
          </AdminButton>
          <span className="admin-geofence__tip">
            Right-click on a marker to remove it
          </span>
          <div className="admin-geofence__bottom-buttons">
            {onDeleteGeofence && (
              <AdminButton
                hollow
                variant={VARIANT.Secondary}
                onClick={() => onDeleteGeofence()}
              >
                Delete Geofence
              </AdminButton>
            )}
            {onAddGeofence && (
              <AdminButton onClick={() => onAddGeofence()}>
                Add Geofence
              </AdminButton>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default AdminGeofence
