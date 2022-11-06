import React from 'react'
import Parse from 'parse'
import PropTypes from 'prop-types'
import moment from 'moment'
import { AdminButton, AdminField, AdminTitle } from '../index'
import {
  CHECK_DATE_FORMAT,
  CHECK_TYPE,
  CHECK_TYPE_TEXT,
  RECURRING_PERIOD,
  RECURRING_PERIOD_TEXT,
  VARIANT,
} from '../../../../utils/constants'
import { AdminForm, AdminFormColumn, AdminFormRow } from '../../../AdminForm'
import TagInput from '../../../TagInput/TagInput'
import utils from '../../../../utils/helpers'
import SelectMembers from '../../SelectMembers/SelectMembers'
import AdminDialogAddOrModifyHaloCheckUpload from './AdminDialogAddOrModifyHaloCheckUpload'

const propTypes = {
  event: PropTypes.object,
  zones: PropTypes.arrayOf(PropTypes.any).isRequired,
  geofences: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  staffGroups: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  staff: PropTypes.arrayOf(PropTypes.instanceOf(Parse.Object)).isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  check: PropTypes.string.isRequired,
}

const eventTypes = Object.values(CHECK_TYPE).map(type => ({
  label: CHECK_TYPE_TEXT[type],
  value: type,
}))
const recurringPeriods = Object.values(RECURRING_PERIOD).map(period => ({
  label: RECURRING_PERIOD_TEXT[period],
  value: period,
}))

const periodsWithoutEndTime = [
  RECURRING_PERIOD.Daily,
  RECURRING_PERIOD.Weekly,
  RECURRING_PERIOD.Monthly,
  RECURRING_PERIOD.Yearly,
]

const isEventOnOneDay = event =>
  moment.utc(event.start_date).isSame(event.end_date, 'date')

const isEndTimeNeededForPeriod = period =>
  !periodsWithoutEndTime.includes(period)

export class AdminDialogAddOrModifyHaloCheck extends React.Component {
  constructor(props) {
    super(props)

    const { check, event } = props

    const isEventOneDay = isEventOnOneDay(event)
    const eventStartDate = moment(event.start_date).format(CHECK_DATE_FORMAT)
    const eventEndDate = moment(event.end_date).format(CHECK_DATE_FORMAT)
    const eventStartTime = moment(event.start_date).format('HH:mm')
    const eventEndTime = moment(event.end_date).format('HH:mm')
    const isStartDateBeforeEndDate = eventStartDate < eventEndDate

    this.state = utils.setDefaultFields(check, {
      title: '',
      descriptionString: '',
      zones: [],
      type: null,
      startAt: eventStartDate,
      startAtTime: eventStartTime,
      recurringEndAt:
        isEventOneDay && isStartDateBeforeEndDate ? eventEndDate : null,
      recurringEndAtTime: isEventOneDay ? eventEndTime : null,
      recurringPeriod: recurringPeriods[0].value,
      users: [],
      image: null,
    })
  }

  onValueChanged(key, value) {
    this.setState(state => ({ ...state, [key]: value }))
  }

  onSubmit() {
    if (this.isDisabled()) {
      return
    }
    if (this.state.recurringPeriod === 'never') {
      this.setState({ recurringEndAt: null })
    }
    const { onDone } = this.props

    onDone({ ...this.state })
  }

  getEndDate() {
    const {
      recurringPeriod,
      recurringEndAt,
      recurringEndAtTime,
      startAtTime,
    } = this.state
    return moment
      .utc(recurringEndAt, CHECK_DATE_FORMAT)
      .time(
        isEndTimeNeededForPeriod(recurringPeriod)
          ? recurringEndAtTime
          : startAtTime,
      )
  }

  getStartDate() {
    const { startAt, startAtTime } = this.state
    return moment.utc(startAt, CHECK_DATE_FORMAT).time(startAtTime)
  }

  getEndDateErrorMessage() {
    const error = this.getEndDateError()
    return error && error.part === 'date' ? error.message : null
  }

  getEndDateError() {
    const {
      recurringEndAt,
      recurringEndAtTime,
      startAtTime,
      recurringPeriod,
    } = this.state
    if (recurringPeriod === RECURRING_PERIOD.Never) {
      return null
    }

    if (isEndTimeNeededForPeriod(recurringPeriod)) {
      if (!recurringEndAt || !recurringEndAtTime) {
        return null
      }
    } else if (!recurringEndAt || !startAtTime) {
      return null
    }

    const isEndDateValid = this.isEndDateValid('date')
    const isEndDateAfterStartDate = this.isEndDateAfterStartDate('date')

    const isStartTimeBeforeEndTime = moment(startAtTime, 'hh:mm').isBefore(
      moment(recurringEndAtTime, 'hh:mm'),
    )

    if (
      isEndTimeNeededForPeriod(recurringPeriod) &&
      !isStartTimeBeforeEndTime
    ) {
      return {
        part: 'time',
        message: 'The end time must be after the start time.',
      }
    }

    if (!isEndDateValid || !isEndDateAfterStartDate) {
      if (!isEndDateValid) {
        return { part: 'date', message: 'Date is not relevant to the event.' }
      }

      if (!isEndDateAfterStartDate) {
        return {
          part: 'date',
          message: 'End date needs to be after start date.',
        }
      }
    }

    return null
  }

  getEndDateTimeError() {
    const errored = this.getEndDateError()

    if (errored && errored.part === 'date') {
      return null
    }

    if (errored && errored.part === 'time') {
      return errored.message
    }

    const { recurringEndAt, recurringEndAtTime } = this.state
    if (recurringEndAt && recurringEndAtTime) {
      if (!this.isEndDateValid('minute')) {
        return 'Time is not relevant to the event.'
      }

      if (!this.isEndDateAfterStartDate('minute')) {
        return 'End time needs to be after start date and time.'
      }
    }

    return null
  }

  recurringPeriodChanged(recurringPeriod) {
    if (periodsWithoutEndTime.includes(recurringPeriod)) {
      this.setState({
        recurringPeriod,
        recurringEndAtTime: null,
      })

      return
    }

    if (recurringPeriod === RECURRING_PERIOD.Never) {
      this.setState({
        recurringPeriod,
        recurringEndAt: null,
        recurringEndAtTime: null,
      })

      return
    }

    this.setState({
      recurringPeriod,
    })
  }

  isDisabled() {
    const { title, type, recurringPeriod, users } = this.state
    if (!title || !type || !recurringPeriod || !users.length) {
      return true
    }

    if (recurringPeriod !== RECURRING_PERIOD.Never) {
      if (!this.isEndDateValid() || !this.isEndDateAfterStartDate()) {
        return true
      }
    }

    return !this.isStartDateValid()
  }

  isEndDateAfterStartDate(granularity = 'minute') {
    if (!this.isEndDateValid()) {
      return false
    }

    return this.getEndDate().isSameOrAfter(this.getStartDate(), granularity)
  }

  isEndDateValid(granularity = 'minute') {
    const {
      recurringPeriod,
      recurringEndAt,
      recurringEndAtTime,
      startAtTime,
    } = this.state

    if (recurringPeriod === RECURRING_PERIOD.Never) {
      return true
    }

    if (isEndTimeNeededForPeriod(recurringPeriod)) {
      if (!recurringEndAt || !recurringEndAtTime) {
        return false
      }
    } else if (!recurringEndAt || !startAtTime) {
      return false
    }

    return this.isDateValid(this.getEndDate(), granularity)
  }

  isStartDateValid() {
    const { startAt, startAtTime } = this.state
    const startDate = this.getStartDate()
    return startAt && startAtTime && this.isDateValid(startDate)
  }

  isDateValid(date, granularity = 'minute') {
    const { event } = this.props
    const eventStartDate = event.start_date
    const eventEndDate = event.end_date

    return moment
      .utc(date, CHECK_DATE_FORMAT)
      .isBetween(eventStartDate, eventEndDate, granularity, '[]')
  }

  render() {
    const { zones, geofences, staffGroups, staff } = this.props
    const data = this.state

    const onValueChanged = key => value => this.onValueChanged(key, value)

    return (
      <div className="admin-dialog-halo-check">
        <AdminTitle>New Check</AdminTitle>

        <AdminForm>
          <AdminFormRow size={2}>
            <AdminFormColumn>
              <AdminField
                type="text"
                value={data.title}
                onChange={onValueChanged('title')}
                label="Title *"
                required="This field is required."
              />
              <AdminField
                type="textarea"
                value={data.descriptionString}
                onChange={onValueChanged('descriptionString')}
                label="Description"
              />

              <div className="admin-dialog-halo-check__tags">
                <div className="admin-field admin-field--text">
                  <label htmlFor="location_zones">Locations (Zones)</label>
                </div>
                <TagInput
                  tags={data.zones}
                  suggestedTags={
                    zones
                      ? zones.filter(zone => !data.zones.includes(zone))
                      : []
                  }
                  onChange={onValueChanged('zones')}
                  submitExcerpt="Press Enter to submit zone"
                />
              </div>

              <AdminField
                type="dropdown"
                value={data.type}
                onChange={onValueChanged('type')}
                label="Type *"
                options={eventTypes}
                required="This field is required."
                placeholder="Please select"
              />
              <AdminField
                type="dropdown"
                value={data.recurringPeriod}
                onChange={value => this.recurringPeriodChanged(value)}
                label="Recurring Check *"
                options={recurringPeriods}
                required="This field is required."
              />

              <AdminFormRow size={1}>
                <AdminFormColumn>
                  <AdminField
                    type="date"
                    value={data.startAt ? moment.utc(data.startAt) : null}
                    onChange={value =>
                      onValueChanged('startAt')(value.format(CHECK_DATE_FORMAT))
                    }
                    label="Date *"
                    placeholder="Please select"
                    required="This field is required."
                    error={
                      data.startAt &&
                      data.startAtTime &&
                      !this.isStartDateValid()
                        ? 'Date is not relevant to the event.'
                        : null
                    }
                  />
                </AdminFormColumn>
                {data.recurringPeriod !== RECURRING_PERIOD.Never ? (
                  <AdminFormColumn>
                    <AdminField
                      type="date"
                      value={
                        data.recurringEndAt
                          ? moment.utc(data.recurringEndAt, CHECK_DATE_FORMAT)
                          : null
                      }
                      onChange={value =>
                        onValueChanged('recurringEndAt')(
                          value.format(CHECK_DATE_FORMAT),
                        )
                      }
                      label="End Date *"
                      placeholder="Please select"
                      required="This field is required."
                      error={this.getEndDateErrorMessage()}
                    />
                  </AdminFormColumn>
                ) : null}
              </AdminFormRow>
              <AdminFormRow size={1}>
                <AdminFormColumn>
                  <AdminField
                    type="time"
                    value={data.startAtTime}
                    onChange={onValueChanged('startAtTime')}
                    label="Time *"
                    placeholder="Please select"
                    required="This field is required."
                  />
                </AdminFormColumn>
                {data.recurringPeriod !== RECURRING_PERIOD.Never ? (
                  <AdminFormColumn>
                    {isEndTimeNeededForPeriod(data.recurringPeriod) ? (
                      <AdminField
                        type="time"
                        value={data.recurringEndAtTime}
                        onChange={onValueChanged('recurringEndAtTime')}
                        label="End Time *"
                        placeholder="Please select"
                        required="This field is required."
                        error={this.getEndDateTimeError()}
                      />
                    ) : null}
                  </AdminFormColumn>
                ) : null}
              </AdminFormRow>

              <p className="muted">
                {data.recurringPeriod !== RECURRING_PERIOD.Never ? (
                  this.isEndDateValid() && this.isEndDateAfterStartDate() ? (
                    <>
                      This check will recur every&nbsp;
                      {data.recurringPeriod ===
                      RECURRING_PERIOD.EveryFifteenMinutes
                        ? '15 minutes'
                        : null}
                      {data.recurringPeriod ===
                      RECURRING_PERIOD.EveryThirtyMinutes
                        ? '30 minutes'
                        : null}
                      {data.recurringPeriod === RECURRING_PERIOD.Hourly
                        ? 'hour'
                        : null}
                      {data.recurringPeriod === RECURRING_PERIOD.Daily
                        ? 'day'
                        : null}
                      {data.recurringPeriod === RECURRING_PERIOD.Weekly
                        ? 'week'
                        : null}
                      {data.recurringPeriod === RECURRING_PERIOD.Monthly
                        ? 'month'
                        : null}
                      {data.recurringPeriod === RECURRING_PERIOD.Yearly
                        ? 'year'
                        : null}
                      &nbsp;
                      {!isEndTimeNeededForPeriod(data.recurringPeriod) ? (
                        <>
                          at {this.getStartDate().time()} until{' '}
                          {this.getEndDate().format('DD/MM/YYYY')}.
                        </>
                      ) : (
                        <>
                          between {this.getStartDate().time()} and{' '}
                          {this.getEndDate().time()} and will repeat daily until{' '}
                          {this.getEndDate().format('DD/MM/YYYY')}.
                        </>
                      )}
                      &nbsp;Checks will be visible to app users 1 hour before
                      they are due.
                    </>
                  ) : null
                ) : (
                  <>
                    This check will be visible to app users 1 hour before they
                    are due.
                  </>
                )}
              </p>
            </AdminFormColumn>
            <AdminFormColumn>
              <label htmlFor="image">Image</label>
              <AdminDialogAddOrModifyHaloCheckUpload
                onChange={onValueChanged('image')}
                defaultFile={data.image}
              />

              <label htmlFor="assignees">Assignees *</label>
              <p className="muted">
                Search and select people to add to this task
              </p>

              <div className="admin-dialog-halo-check__assignees">
                <SelectMembers
                  onChange={users => this.setState({ users })}
                  selected={data.users}
                  geofences={geofences}
                  staffGroups={staffGroups}
                  staff={staff}
                />
              </div>
            </AdminFormColumn>
          </AdminFormRow>
        </AdminForm>

        <div className="button-panel">
          <AdminButton hollow onClick={this.props.onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            variant={VARIANT.Secondary}
            onClick={() => this.onSubmit()}
            disabled={this.isDisabled()}
          >
            {this.props.check ? 'Save Check' : 'Create Check'}
          </AdminButton>
        </div>
      </div>
    )
  }
}

AdminDialogAddOrModifyHaloCheck.propTypes = propTypes

AdminDialogAddOrModifyHaloCheck.defaultProps = {
  event: null,
}

export default AdminDialogAddOrModifyHaloCheck
