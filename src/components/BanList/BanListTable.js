import React from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'

const propTypes = {
  onEdit: PropTypes.func.isRequired,
}
class BanListTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      MasterChecked: false,
      SelectedList: [],
      List: [],
    }
  }
  static getDerivedStateFromProps(props, state) {
    state.List = props.ejectItem
  }
  // Select/ UnSelect Table rows
  onMasterCheck(e) {
    let tempList = this.state.List
    // Check/ UnCheck All Items
    tempList.map(user => (user.selected = e.target.checked))

    //Update State
    this.setState({
      MasterChecked: e.target.checked,
      List: tempList,
      SelectedList: this.state.List.filter(e => e.selected),
    })
  }

  // Update List Item's state and Master Checkbox State
  onItemCheck(e, item) {
    let tempList = this.state.List
    tempList.map(user => {
      if (user.id === item.id) {
        user.selected = e.target.checked
      }
      return user
    })

    //To Control Master Checkbox State
    const totalItems = this.state.List.length
    const totalCheckedItems = tempList.filter(e => e.selected).length

    // Update State
    this.setState({
      MasterChecked: totalItems === totalCheckedItems,
      List: tempList,
      SelectedList: this.state.List.filter(e => e.selected),
    })
  }

  // Event to get selected rows(Optional)
  getSelectedRows() {
    this.setState({
      SelectedList: this.state.List.filter(e => e.selected),
    })
  }

  render() {
    return (
      <div>
        <div className="incidents__content__header table_header">
          <h2>Bulletin Board</h2>
          <div className="search-input">
            <input placeholder="search" />
          </div>
        </div>
        <div>
          <table className="custom_ban_table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={this.state.MasterChecked}
                    id="mastercheck"
                    onChange={e => this.onMasterCheck(e)}
                  />
                </th>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Height</th>
                <th>Ethnic</th>
                <th>Type</th>
                <th>Feature</th>
                <th>Banned since</th>
                <th>Photos</th>
              </tr>
            </thead>
            <tbody>
              {this.state.List.map(item => (
                <tr
                  key={item.object_id}
                  className={item.selected ? 'selected' : ''}
                  onClick={() => {
                    this.props.onEdit(item.object_id)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <td scope="row">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      className="form-check-input"
                      id="rowcheck{item.id}"
                      onChange={e => this.onItemCheck(e, item)}
                    />
                  </td>
                  <td>{item.capture_data.firstName}</td>
                  <td>{item.capture_data.gender === 'male' ? 'M' : 'F'}</td>
                  <td>{item.capture_data.age}</td>
                  <td>{item.capture_data.height} mts.</td>
                  <td>{item.capture_data.ethnicOrigin}</td>
                  <td>
                    {item.capture_data.banType === 'type1'
                      ? 'Venue'
                      : 'type2'
                      ? 'Police'
                      : 'Court'}
                  </td>
                  <td>{item.capture_data.marks}</td>
                  <td>{moment(item.created_at).format('DD/MM/YY HH:mm')}</td>
                  <td>{item.img_file === '' ? 'No photos' : '1 photo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}
BanListTable.propTypes = propTypes

export default BanListTable
