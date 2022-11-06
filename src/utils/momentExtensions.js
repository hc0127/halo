import moment from 'moment'

// RegExp used to validate format of HH:mm and to validate correct time
const timeFormatCheck = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * Get or set Time
 * @description Getting or setting hours and minutes of Moment date object from Time format
 * @param {string=} timeString = Time must be in a format of HH:mm
 * @return moment.Moment
 */
moment.fn.time = function(timeString) {
  if (!timeString) {
    return this.format('HH:mm')
  }

  if (!timeFormatCheck.test(timeString)) {
    throw new Error(
      'Invalid time string: Must be in format of HH:mm and be a valid time.',
    )
  }

  let [hours, minutes] = timeString.split(':')
  hours = parseInt(hours, 10)
  minutes = parseInt(minutes, 10)

  return this.hours(hours).minutes(minutes)
}
