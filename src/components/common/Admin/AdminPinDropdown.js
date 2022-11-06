import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'

import { AdminField } from '.'
import ButtonWithIcon from '../ButtonWithIcon'
import DashboardPinIcon from './../../DashboardPin/DashboardPinIcon'
import ChatIcon from '../../common/ChatIcon/ChatIcon'
import { BUTTON_ICONS, VARIANT } from '../../../utils/constants'

import StandardPin from '../../../images/pins/pin-standard.svg'
import AdminPin from '../../../images/pins/pin-admin.svg'
import FirePin from '../../../images/pins/pin-fire.svg'
import MedicPin from '../../../images/pins/pin-medic.svg'
import LeadCarPin from '../../../images/pins/pin-leadcar.svg'
import HousekeepingPin from '../../../images/pins/pin-housekeeping.svg'
import PolicePin from '../../../images/pins/pin-police.svg'
import utils from '../../../utils/helpers'

const baseOptions = [
  { value: 'standard', label: 'Standard', pinSrc: StandardPin },
  { value: 'admin', label: 'Admin', pinSrc: AdminPin },
  { value: 'fire', label: 'Fire', pinSrc: FirePin },
  { value: 'medic', label: 'Medic', pinSrc: MedicPin },
  { value: 'leadcar', label: 'Lead/Rear Car', pinSrc: LeadCarPin },
  { value: 'housekeeping', label: 'Housekeeping', pinSrc: HousekeepingPin },
  { value: 'police', label: 'Police', pinSrc: PolicePin },
  { value: 'custom', label: 'Custom' },
]

class AdminPinDropdown extends Component {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onFileSelection: PropTypes.func.isRequired,
    fullName: PropTypes.string.isRequired,
    customPinFile: PropTypes.oneOfType([
      PropTypes.instanceOf(Parse.File),
      PropTypes.instanceOf(File),
    ]),
  }
  static defaultProps = {
    customPinFile: null,
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.fileInputRef = React.createRef()
  }

  onFileChange = e => {
    const { onFileSelection } = this.props

    const file = e.currentTarget.files[0]

    if (!file) {
      onFileSelection(undefined)
    }

    const img = new Image()
    img.onload = () => {
      if (img.width >= 256 || img.height >= 256) {
        onFileSelection(undefined)
        this.setState({ error: `Selected image is over ${256}px*${256}px` })
      } else {
        this.setState({ error: '' })
        onFileSelection(file)
      }
    }
    img.src = URL.createObjectURL(file)
  }

  render() {
    const { value, onChange, fullName, customPinFile } = this.props

    const { label } = baseOptions.find(option => option.value === value)

    let pinUrl = baseOptions.find(option => option.value === value).pinSrc

    if (value === 'custom') {
      if (customPinFile) {
        pinUrl = customPinFile.url
      }
    }

    return (
      <div className="admin-pin-dropdown">
        <DashboardPinIcon type={value} customPinSrc={pinUrl}>
          {fullName && (
            <ChatIcon
              size={20}
              name={fullName}
              backgroundColor="transparent"
              color="white"
            />
          )}
        </DashboardPinIcon>
        <AdminField
          options={baseOptions}
          type="react-select"
          onChange={onChange}
          value={{ value, label }}
          label="Pin"
          error={this.state.error}
          hasChanged={!!this.state.error}
        />
        <div
          className={utils.makeClass(
            'admin-pin-dropdown__upload-button',
            value === 'custom' && 'visible',
          )}
        >
          <ButtonWithIcon
            icon={BUTTON_ICONS.Upload}
            variant={VARIANT.NoBackground}
            onClick={() => this.fileInputRef.current.click()}
            title="Upload"
          />
          <input
            type="file"
            ref={this.fileInputRef}
            onChange={this.onFileChange}
            accept=".png,.jpg,.svg"
          />
        </div>
      </div>
    )
  }
}

export default AdminPinDropdown
