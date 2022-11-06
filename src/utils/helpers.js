import moment from 'moment'
import Parse from 'parse'
import toImg from 'react-svg-to-image'
import _ from 'lodash'
import {
  ALERT_MINUTES_WITHOUT_UPDATE,
  CHECK_STATUS,
  INCIDENT_WHAT_TEXT_BY_TYPE,
  ROLE_OPTIONS,
  USER_PERMISSIONS,
  CLIENT_FEATURES,
} from './constants'
import { getTicketLogs } from '../api/ticket-scanning'

const makeReadable = string => {
  const makeReadableExceptions = {
    drugs: 'Drinks / Drugs',
    healthSafety: 'Health & Safety',
    lostProperty: 'Lost & Found',
    suspicious: 'Suspicious Activity',
    hotline: 'Hotline',
    coded: 'Coded',
    noise: 'Noise',
    customerService: 'Public Reporting',
  }

  if (makeReadableExceptions[string]) {
    return makeReadableExceptions[string]
  }

  return string
    .replace('_', ' ')
    .replace(/([A-Z][a-z]+)/g, ' $1')
    .replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    )
}

const formatString = (format, values) =>
  format.replace(/{(\d)}/g, (match, number) =>
    values[number] !== undefined ? values[number] : match,
  )

const getInitials = name => {
  const firstLetters = name.match(/\b\w/g)

  if (firstLetters === null) {
    return ''
  }

  return (
    (firstLetters.shift() || '') + (firstLetters.pop() || '')
  ).toUpperCase()
}

const formatEventDate = event => {
  let dateShownModified = new Date(event.start_date).toLocaleDateString()
  const endDate = new Date(event.end_date).toLocaleDateString()
  if (endDate !== dateShownModified) {
    dateShownModified += ` ~ ${endDate}`
  }
  return dateShownModified
}

const badGeofenceDataCleanup = geofence => {
  // take in the sashido array and return a lat lon array of objects
  // [52.1, -1.3, 52.2, -1.35] => [{lat: 52.1, lng: -1.3},{lat: 52.2, lng: -1.35}]
  const returnArray = []
  let tempObject = {}

  geofence.map((item, index) => {
    if (index % 2 === 0) {
      tempObject = {}
      tempObject.lat = item
    } else {
      tempObject.lng = item
      returnArray.push(tempObject)
    }
    return ''
  })
  return returnArray
}

const mapMarkerDefinition = event => {
  let mapMarkerLocation
  let geofenceData = event ? event.attributes.geofence : []
  if (geofenceData && geofenceData.length) {
    geofenceData = badGeofenceDataCleanup(geofenceData)
    mapMarkerLocation = {
      lat:
        geofenceData.map(data => data.lat).reduce((acc, val) => acc + val) /
        geofenceData.length,
      lng:
        geofenceData.map(data => data.lng).reduce((acc, val) => acc + val) /
        geofenceData.length,
    }
  } else {
    mapMarkerLocation = { lat: 52.95, lng: -1.1393030647327955 }
  }
  return mapMarkerLocation
}

const cleanObservableMap = data => {
  if (!data) return []
  const unMappedData = data.toJSON()
  return Object.keys(unMappedData).map(key => unMappedData[key])
}

const generateIncidentCode = incidentType => {
  const date = new Date()

  let incidentInitials = getInitials(makeReadable(incidentType)).toUpperCase()

  if (incidentType.startsWith('custom')) {
    incidentInitials = 'C'
  }
  const hours = `0${date.getHours().toString()}`.slice(-2)
  const minutes = `0${date.getMinutes().toString()}`.slice(-2)
  const seconds = `0${date.getSeconds().toString()}`.slice(-2)
  const day = `0${date.getDate().toString()}`.slice(-2)
  const month = `0${(date.getMonth() + 1).toString()}`.slice(-2)
  const year = (date.getFullYear() % 100).toString()

  return `${incidentInitials}${hours}${minutes}${seconds}-${day}${month}${year}`
}
// TODO: Remove this function, it's horrible
const trimValues = obj => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].trim()
    }
  })
  return obj
}

const getDataById = (data, id) => {
  for (let i = 0; i < data.length; i++) {
    const element = data[i]

    if (element.id === id) {
      return element
    }
    if (element.objectId === id) {
      return element
    }
  }
  return null
}

// this function will get the friendly name for permissions
const getFriendlyPermissions = permission => {
  for (let i = 0; i < ROLE_OPTIONS.length; i++) {
    const role = ROLE_OPTIONS[i]
    if (role.value === permission) {
      return role.label
    }
  }
  return permission
}

const getFieldValue = (allValues, key) => {
  const [item] = allValues.filter(val => val.value === key)
  if (!item) {
    return key
  }
  return item.text
}

const getCustomIncidentName = (type, customTypes) => {
  const [customType] = customTypes.filter(custom => custom.type === type)

  return customType ? customType.label : 'Unknown Custom Incident'
}

const getIncidentName = (type, customTypes) => {
  if (type.startsWith('custom') && type !== 'customerService') {
    return getCustomIncidentName(type, customTypes)
  }
  return makeReadable(type)
}

const getIncidentStatusText = incident => {
  return (
    (incident.archived && 'Closed') ||
    (incident.resolved && 'Resolved') ||
    'Open'
  )
}

const loopedQuery = (Parse, query, loopProcessor, noSkipping) =>
  query.count().then(resultCount => {
    const pageLength = 1000
    const pageCount = Math.ceil(resultCount / pageLength)

    let loopPromise = Promise.resolve([])

    for (let i = 0; i <= pageCount; i++) {
      // eslint-disable-next-line no-loop-func
      loopPromise = (page =>
        loopPromise
          .then(results => loopProcessor(results, page))
          .then(() => {
            query.limit(pageLength)
            if (noSkipping !== true) {
              query.skip(page * pageLength)
            }
            return query.find()
          }))(i)
    }
    return loopPromise
  })

const flattenArray = arrayToFlatten => [].concat(...arrayToFlatten)

const formatDate = (date, format = 'DD-MM-YYYY') => moment(date).format(format)

const average = arrayOfInt =>
  arrayOfInt.length
    ? arrayOfInt.reduce((a, b) => a + b, 0) / arrayOfInt.length
    : 0

const hasFeature = (userOrEventOrClient, feature) => {
  if (!userOrEventOrClient) {
    return false
  }

  switch (userOrEventOrClient.className) {
    case 'Client':
      return (userOrEventOrClient.get('enabledFeatures') || []).includes(
        feature,
      )

    case 'Event':
      return hasFeature(userOrEventOrClient.get('client'), feature)

    case '_User':
      return (
        userOrEventOrClient.get('permissionRole') ===
          USER_PERMISSIONS.CrestAdmin ||
        hasFeature(userOrEventOrClient.get('client'), feature)
      )

    default:
      return false
  }
}

const hasTicketScanning = event =>
  event?.client.enabled_features.includes('ticketScanning')

const hasDashboardFiltering = event => {
  return event?.client.enabled_features.includes('dashboardFiltering')
}

const hasMenuFeatures = (user, feature) => {
  return (
    user.permission_role === USER_PERMISSIONS.CrestAdmin ||
    (user.client.enabled_features || []).includes(feature)
  )
}

const hasHaloChecks = client => {
  if (!client) {
    return false
  }
  return client.enabled_features.includes(CLIENT_FEATURES.VenueChecks)
}

const hasMultiGeoFence = client => {
  if (!client) {
    return false
  }
  return client.enabled_features.includes('multiGeofences')
}

const hasBranding = client => {
  if (!client) {
    return false
  }
  return client?.enabled_features?.includes('clientBranding')
}

const hasUserGroups = client => {
  if (!client) {
    return false
  }
  return client?.enabled_features?.includes('userGroups')
}

const hasIncidentTriaging = event => {
  return event?.client.enabled_features.includes('incidentTriaging')
}

const hasPublicReporting = client =>
  client?.enabled_features.includes('publicReport')

const hasTargetedDashboard = client =>
  client?.enabled_features.includes('targetedDashboard')

const isValidEmail = email => /\S+?@\S+?\.\S+?/.test(email)

const isValidPassword = password =>
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^a-zA-Z0-9]/.test(password) &&
  password.length >= 8

const canUserSetRole = (user, role) => {
  switch (user.permission_role) {
    case USER_PERMISSIONS.CrestAdmin:
      return true
    case USER_PERMISSIONS.ClientManager:
      return (
        role === USER_PERMISSIONS.NormalUser ||
        role === USER_PERMISSIONS.EventManager ||
        role === USER_PERMISSIONS.ClientManager ||
        role === USER_PERMISSIONS.TargetedDashboardUser
      )
    default:
      return false
  }
}

const notWhitespace = str => /\S/.test(str)

const sort = (values, method, direction) => {
  const sortValues = values.slice(0)
  sortValues.sort((item1, item2) => {
    if (direction === 'desc') {
      if (method(item2) > method(item1)) {
        return 1
      }

      if (method(item2) < method(item1)) {
        return -1
      }
      return 0
    }

    if (method(item1) > method(item2)) {
      return 1
    }

    if (method(item1) < method(item2)) {
      return -1
    }

    return 0
  })
  return sortValues
}

/**
 * Sort by multiple
 * @description Use it with multiple keys and sort definitions, like { order: 1, createdAt: -1 }
 * @param {[]} arr
 * @param {Object.<string, number>} sortDefinition
 * @return {[]} arr
 */
const sortByMultiple = (arr, sortDefinition) => {
  const sortValues = [...arr]

  sortValues.sort((item1, item2) => {
    let value = 0
    Object.keys(sortDefinition).some(key => {
      const order = sortDefinition[key]
      const el1 = item1 instanceof Parse.Object ? item1.get(key) : item1[key]
      const el2 = item2 instanceof Parse.Object ? item2.get(key) : item2[key]

      if (el1 !== el2) {
        value = el1 < el2 ? -order : order
      }

      return !!value
    })

    return value
  })

  return sortValues
}

const hasDuplicate = array => new Set(array).size !== array.length

const isStringIn = (searchString, searchedString) =>
  new RegExp(searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi').test(
    searchedString,
  )

const hasPermission = (user, permissions) =>
  permissions.some(permission => user.permission_role === permission)

const cloneQuery = query => {
  const clone = _.clone(query)
  clone._where = _.clone(query._where)
  return clone
}

const makeClass = (className, ...modifiers) => {
  const fullClassName = className.join ? className.join('__') : className
  return [
    fullClassName,
    ...modifiers.filter(mod => !!mod).map(mod => `${fullClassName}--${mod}`),
  ].join(' ')
}

const isUserActive = user => {
  const timeSinceLastUpdated = new Date() - new Date(user.updated_at)
  const minutesSinceLastUpdate = Math.round(timeSinceLastUpdated / 1000 / 60)
  return minutesSinceLastUpdate <= ALERT_MINUTES_WITHOUT_UPDATE
}

const isBookedOn = (user, event) =>
  user.current_event?.object_id === event.object_id

const getFormattedDateOffset = (date, format = null) => {
  const updatedAt = moment(date)
  const diff = moment().diff(updatedAt, 'days')

  if (diff > 7) {
    return 'over a week ago'
  }

  if (diff > moment().daysInMonth()) {
    return 'over a month ago'
  }

  const today = format === 'Today' ? format : updatedAt.format('HH:mm')

  return diff < 1 ? today : `${diff} day${diff > 1 ? 's' : ''} ago`
}

const getIncidentWhatText = incident => {
  const captureData = incident.capture_data
  const typeValue = incident.type_value
  const prefixTypeValues = [
    'lostProperty',
    'theft',
    'hotline',
    'coded',
    'noise',
  ]
  let prefix = ''

  if (prefixTypeValues.includes(typeValue)) {
    const { propertyType } = captureData
    let prefixValue

    if (typeValue === 'lostProperty') {
      prefixValue = 'lostFound'
    } else {
      prefixValue = typeValue
    }

    prefix =
      prefixValue !== undefined
        ? `${makeReadable(prefixValue)}${
            propertyType !== undefined ? ` - ${propertyType}` : ''
          } - `
        : ''
  }

  if (incident.type_value === 'missingPerson') {
    return `${captureData.firstName || ''} ${captureData.lastName || ''}`
  }

  if (incident.type_value === 'medical') {
    return `${captureData.medicalNotes || 'N/A'}`
  }

  return `${prefix}${captureData.otherNotes ||
    captureData[
      INCIDENT_WHAT_TEXT_BY_TYPE[
        incident.type_value || INCIDENT_WHAT_TEXT_BY_TYPE.default
      ]
    ] ||
    'N/A'}`
}

const removeDuplicate = (array, uniqueFunction = value => value) =>
  array.filter(
    (value, index) =>
      array.findIndex(
        arrayVal => uniqueFunction(value) === uniqueFunction(arrayVal),
      ) === index,
  )

const isIncidentReadByUser = (incident, user) =>
  incident.user_views.some(
    userView => userView.user && userView?.user?.object_id === user.object_id,
  )

const isIncidentReadByUserAsync = async (incident, user) => {
  const incidentViewAreForGivenUserAsync = incident.user_views.map(
    async userView => {
      if (!userView.user) {
        await userView.fetch()
      }
      return userView.user.object_id === user.object_id
    },
  )
  const incidentViewAreForGivenUser = await Promise.all(
    incidentViewAreForGivenUserAsync,
  )
  return incidentViewAreForGivenUser.some(view => view)
}

const cleanFileName = filename => filename.replace(/,/, '')

const calculateBannedUntil = (bannedOn, banDuration, banTerm) => {
  if (!banDuration || !banTerm) {
    return bannedOn
  }

  const date = moment(bannedOn)

  const duration = parseInt(banDuration, 10)

  switch (banTerm) {
    case 'hours':
      date.add(duration, 'hours')
      break
    case 'days':
      date.add(duration, 'days')
      break
    case 'months':
      date.add(duration, 'months')
      break
    case 'years':
      date.add(duration, 'years')
      break
    case 'life':
      date.add(100, 'years')
      break
    default:
      break
  }

  return date.toDate()
}

const isUserAllowedToCreateUsers = (currentUser, staffCounts) => {
  if (
    currentUser.permission_role === USER_PERMISSIONS.CrestAdmin ||
    (currentUser.permission_role === USER_PERMISSIONS.ClientManager &&
    currentUser.client.staff_limit !== null
      ? staffCounts[currentUser.client.object_id] <
        currentUser.client.staff_limit
      : true)
  ) {
    return true
  }

  const client = currentUser.client

  if (!client.staff_limit) {
    return true
  }

  if (!staffCounts[client.object_id]) {
    return false
  }

  const staffCount = staffCounts[client.object_id]

  return staffCount < client.staff_limit
}

const downloadFile = (contents, filename) => {
  const url = window.URL.createObjectURL(contents)
  const link = createHiddenDownloadLink({ url, filename })
  link.click()

  removeHiddenDownloadLink(link)

  window.URL.revokeObjectURL(url)
}

const createHiddenDownloadLink = ({ url, filename }) => {
  const link = document.createElement('a')

  document.body.appendChild(link)

  link.style = 'display: none'
  link.href = url
  link.download = `TicketScanningLogs-${filename}.csv`

  return link
}

const removeHiddenDownloadLink = link => {
  document.body.removeChild(link)
}

const setDefaultFields = (...objects) => {
  const obj = {}
  objects.filter(Boolean).forEach(extending => {
    Object.keys(extending).forEach(key => {
      obj[key] = obj[key] || extending[key]
    })
  })

  return obj
}

const getEventCheckStatus = check => {
  const checkStatus = check.status || CHECK_STATUS.Pending
  if (
    check.status !== 'complete' &&
    moment()
      .add(moment().utcOffset(), 'minutes')
      .isAfter(check.occurs_at)
  ) {
    return CHECK_STATUS.Late
  }

  return checkStatus
}

const isEventCompletedOnTime = check => {
  const checkStatus = check.status || CHECK_STATUS.Pending
  if (
    checkStatus === 'complete' &&
    moment(check?.occurs_at).isAfter(moment(check.completed_at), 'minutes')
  ) {
    return true
  } else if (checkStatus === CHECK_STATUS.Pending) {
    return checkStatus
  }
  return false
}

const isEventCheckUnseen = (check, currentUser) => {
  const messages = check.messages || []
  const messageReadList = check.message_read_list || []
  return messages.length && !messageReadList.includes(currentUser.object_id)
}

const getCheckAssigneesText = assignees =>
  assignees.length > 1
    ? `${assignees.length} People`
    : assignees[0] && assignees[0].name
    ? assignees[0].name
    : 'Unknown person'

const makePointer = (className, objectId) => ({
  className,
  objectId,
  __type: 'Pointer',
})

const groupItemsBy = (items, fieldGetter) => {
  const groupedItem = {}

  if (!items || !items.length) return {}

  items.forEach(item => {
    const groupField = fieldGetter(item)

    if (!groupedItem[groupField]) groupedItem[groupField] = []
    groupedItem[groupField].push(item)
  })

  return groupedItem
}

const isFileImageByExtensionType = fileName =>
  fileName.endsWith('.jpg') ||
  fileName.endsWith('.jpeg') ||
  fileName.endsWith('.png') ||
  fileName.endsWith('.gif') ||
  fileName.endsWith('.svg') ||
  fileName.endsWith('.heic') ||
  fileName.endsWith('.heif') ||
  fileName.endsWith('.tiff') ||
  fileName.endsWith('.tif') ||
  fileName.endsWith('.webp') ||
  fileName.endsWith('.bmp')

const formatPoints = coordinates => {
  return coordinates.map(coordinate => ({
    latitude: coordinate[0],
    longitude: coordinate[1],
  }))
}

const base64EncodeFile = file => {
  const isNotUploadingFile = file === null || file === ''
  const isFileExisting = file?.url && file?.name
  if (isNotUploadingFile || isFileExisting) {
    return null
  } else {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }
}

const convertSvgtoPng = file =>
  toImg('svg', file.name, {
    format: 'png',
    download: false,
  })

const formatHaloChecksInput = check => {
  // format halo checks
  return {
    object_id: check.object_id,
    event: check.event,
    title: check.title,
    description: check.description || check.descriptionString,
    users: check.users,
    zones: check.zones,
    event_type: check.event_type || check.type,
    start_at: check.start_at || check.startAt,
    start_at_time: check.start_at_time || check.startAtTime,
    recurring_end_at: check.recurring_end_at || check.recurringEndAt,
    recurring_end_at_time:
      check.recurring_end_at_time || check.recurringEndAtTime,
    recurring_period: check.recurring_period || check.recurringPeriod,
  }
}
const formatHaloChecks = haloChecks => {
  const formatTime = time => `${time.split(':')[0]}:${time.split(':')[1]}`
  return haloChecks.map(check => ({
    ...check,
    event: check.event.object_id,
    start_at_time: formatTime(check.start_at_time),
    recurring_end_at_time: check.recurring_end_at_time
      ? formatTime(check.recurring_end_at_time)
      : null,
  }))
}

export const formatPaginatedUrl = data => {
  const hasPage = page => page && page.includes('page')

  const pageNo = hasPage(data.next)
    ? Number(data?.next?.match(/page=([^&]*)/)[1])
    : 1

  return pageNo
}

/* will dry above and below into one function at at some point but used in a lot of places so keeping them separate for now as will require a lot of testing */
export const formatPaginatedPrevUrl = data => {
  const hasPage = page => page && page.includes('page=')

  const pageNo = hasPage(data.previous)
    ? Number(data?.previous?.match(/page=([^&]*)/)[1])
    : 1

  return pageNo
}

export const filterSuspendedUsers = (staff, assignedStaff) => {
  let filterSuspendedUsers = []

  for (const idx of assignedStaff) {
    for (const idz of staff) {
      if (idx === idz.object_id && !idz.suspended) {
        filterSuspendedUsers.push(idx)
      }
    }
  }

  return filterSuspendedUsers
}

export const filterUnnasignedUsersFromChecks = (adminChecks, assignedStaff) => {
  for (const idx of adminChecks) {
    let adminCheckFilteredUsersList = []
    for (const idz of idx.users) {
      if (assignedStaff.includes(idz)) {
        adminCheckFilteredUsersList.push(idz)
      }
    }
    idx.users = adminCheckFilteredUsersList
  }

  return adminChecks
}

export const getUniqueListBy = (arr, key) => {
  return [...new Map(arr.map(item => [item[key], item])).values()]
}

export const calculateIndex = (index, pageCount, rowLength) => {
  if (pageCount && rowLength) {
    return index + pageCount * rowLength
  } else return index
}

export const getAllTicketLogs = async (count, eventId) => {
  const totalPages = Math.ceil(count / 2000)
  let totalScans = []

  for (let i = 0; i < totalPages; i++) {
    const page = i + 1
    const results = await getTicketLogs(eventId, page)
    totalScans.push(...results)
  }

  return totalScans
}

export const getTimeDiffAsMinutes = dateTime => {
  if (!dateTime) return 0

  const now = moment(new Date())
  const then = moment(dateTime)

  return now.diff(then, 'minutes')
}

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'))
}

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate()
}

const getDaysInYear = year => {
  return Array.from(Array(parseInt(12)).keys()).reduce(
    (res, month) => (res += getDaysInMonth(year, month + 1)),
    0,
  )
}

export default {
  calculateIndex,
  filterSuspendedUsers,
  filterUnnasignedUsersFromChecks,
  makeReadable,
  formatString,
  getInitials,
  formatEventDate,
  badGeofenceDataCleanup,
  mapMarkerDefinition,
  cleanObservableMap,
  generateIncidentCode,
  trimValues,
  getDataById,
  getFriendlyPermissions,
  getFieldValue,
  getCustomIncidentName,
  getIncidentName,
  getIncidentStatusText,
  loopedQuery,
  flattenArray,
  formatDate,
  average,
  hasFeature,
  hasHaloChecks,
  hasMultiGeoFence,
  hasBranding,
  hasUserGroups,
  hasIncidentTriaging,
  hasMenuFeatures,
  hasDashboardFiltering,
  hasTicketScanning,
  hasPublicReporting,
  hasTargetedDashboard,
  isValidEmail,
  isValidPassword,
  canUserSetRole,
  notWhitespace,
  sort,
  sortByMultiple,
  hasDuplicate,
  isStringIn,
  hasPermission,
  cloneQuery,
  makeClass,
  isUserActive,
  isBookedOn,
  getFormattedDateOffset,
  getIncidentWhatText,
  removeDuplicate,
  isIncidentReadByUser,
  isIncidentReadByUserAsync,
  cleanFileName,
  calculateBannedUntil,
  isUserAllowedToCreateUsers,
  downloadFile,
  setDefaultFields,
  getEventCheckStatus,
  isEventCompletedOnTime,
  isEventCheckUnseen,
  getCheckAssigneesText,
  makePointer,
  groupItemsBy,
  isFileImageByExtensionType,
  formatPoints,
  base64EncodeFile,
  convertSvgtoPng,
  formatHaloChecksInput,
  formatPaginatedUrl,
  formatHaloChecks,
  getAllTicketLogs,
  getTimeDiffAsMinutes,
}

export { getCurrentUser, getDaysInMonth, getDaysInYear }
