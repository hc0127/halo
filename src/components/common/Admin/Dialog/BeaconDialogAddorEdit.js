import React, { Fragment, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Parse from 'parse'
import AdminField from '../AdminField'
import { AdminButton, AdminTitle } from '..'
import { VARIANT } from '../../../../utils/constants'
import { AdminFormColumn, AdminForm, AdminFormRow } from '../../../AdminForm'
import {
  saveBeaconsAction,
  loadBeacon,
  clearBeacon,
} from '../../../../stores/ReduxStores/admin/beacondetails'
import Loading from '../../Loading/Loading'

const propTypes = {
  onClose: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  beacon_id: PropTypes.string,
  beaconDetails: PropTypes.object,
}

const BeaconDialogAddorEdit = ({
  onClose,
  dispatch,
  beacon_id,
  beaconDetails,
}) => {
  const [beaconName, setBeaconName] = useState('')
  const [location, setLocation] = useState('')
  const [loadingdata, setLoadingData] = useState(false)
  const [title, setTitle] = useState(null)

  useEffect(() => {
    if (beacon_id) {
      setLoadingData(true)
      getBecaonById()
    }
    return () => {
      dispatch(clearBeacon())
    }
  }, [])

  useEffect(() => {
    if (beaconDetails) {
      setBeaconName(beaconDetails.beacon_name)
      setLocation(beaconDetails.location)
      setTitle(beaconDetails.beacon_name)
      setLoadingData(false)
    }
  }, [beaconDetails])

  const getBecaonById = () => {
    try {
      dispatch(loadBeacon(beacon_id))
    } catch (error) {
      console.log('Get Beacon Error', error)
    }
  }

  const saveBeacon = async () => {
    const data = {
      id: beacon_id,
      beacon_name: beaconName,
      beacon_location: location,
    }
    try {
      dispatch(saveBeaconsAction(data))
    } catch (error) {
      console.log('Beacon Save Error', error)
    }
  }

  const handleChangeId = value => {
    setBeaconName(value)
  }
  const handleChangeLocation = value => {
    setLocation(value)
  }

  return (
    <Fragment>
      <div className="beacon-dialog-modelwith">
        {loadingdata ? (
          <Loading centered />
        ) : (
          <>
            <div className="beacon-dialog-title">
              <AdminTitle>{title || 'Create Beacon'}</AdminTitle>
            </div>
            <AdminForm size={4}>
              <AdminFormColumn size={2}>
                <AdminFormRow size={1}>
                  <AdminField
                    label="Beacon ID"
                    type="text"
                    value={beaconName}
                    onChange={handleChangeId}
                    required="Please enter Beacon ID."
                  />
                </AdminFormRow>
              </AdminFormColumn>
              <AdminFormColumn size={2}>
                <AdminFormRow size={1}>
                  <AdminField
                    label="Location"
                    type="text"
                    value={location}
                    onChange={handleChangeLocation}
                    required="Please enter Location."
                  />
                </AdminFormRow>
              </AdminFormColumn>
            </AdminForm>
            <div className="beacon-dialog-buttoncontainer">
              <AdminButton hollow onClick={onClose}>
                Cancel
              </AdminButton>
              <AdminButton variant={VARIANT.Primary} onClick={saveBeacon}>
                Confirm
              </AdminButton>
            </div>
          </>
        )}
      </div>
    </Fragment>
  )
}

BeaconDialogAddorEdit.propTypes = propTypes

BeaconDialogAddorEdit.defaultProps = {
  beacon_id: null,
  beaconDetails: null,
}

export default connect(state => {
  const beaconDetails = state.beacondetails?.activeBeacon?.data
  return {
    beaconDetails: beaconDetails,
  }
})(BeaconDialogAddorEdit)
