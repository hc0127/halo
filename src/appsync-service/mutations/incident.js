import {
  createIncidentMutation,
  updateIncidentMutation,
  createIncidentMessageMutation,
  createMarkIncidentAsReadMutation,
  createIncidentMessageAsReadMutation,
} from '../graphql/mutations'
import { client } from '../'
import { validateAndGenerateFields } from '../utlis'

let currentUserId
try {
  const currentUser = JSON.parse(localStorage.getItem('user'))
  currentUserId = currentUser?.object_id
} catch (error) {}

const createIncidentFields = {
  object_id: true,
  location: true,
  status_value: 'number',
  tags: true,
  incident_code: true,
  type_value: true,
  capture_data: 'json',
  triaged: true,
  debrief: true,
  event_id: true,
  created_by_id: true,
  imported: true,
}
const updateIncidentFields = {
  id: true,
  type_value: true,
  status_value: 'number',
  mode: 'enum',
  capture_data: 'json',
  loggedInUserId: true,
  tags: true,
  triaged: true,
}

const resolveIncidentFields = {
  id: true,
  mode: 'enum',
  loggedInUserId: true,
  resolved_text: true,
}

const closeIncidentFields = {
  id: true,
  mode: 'enum',
  loggedInUserId: true,
  archived_text: true,
  debrief: true,
}

const reopenIncidentFields = {
  id: true,
  mode: 'enum',
  loggedInUserId: true,
}

const createIncidentMessageFields = {
  object_id: true,
  incident_id: true,
  message: true,
  attachment: true,
  loggedInUserId: true,
}

const markIncidentAsReadFields = {
  incident_id: true,
  loggedInUserId: true,
}

const incidentMessageAsReadFields = {
  incident_id: true,
  loggedInUserId: true,
}

export const createIncident = async (eventId, params) => {
  params = {
    ...params,
    created_by_id: currentUserId,
    event_id: eventId,
  }

  params = validateAndGenerateFields(params, createIncidentFields)

  try {
    let { data } = await client.mutate({
      mutation: createIncidentMutation(params),
    })

    return data.createIncident.item
  } catch (error) {
    console.log('Error:::createIncident:::', error)

    return error
  }
}
export const updateIncident = async (incidentId, params) => {
  params = {
    ...params,
    id: incidentId,
    mode: 'OTHER',
    loggedInUserId: currentUserId,
  }

  params = validateAndGenerateFields(params, updateIncidentFields)
  try {
    let { data } = await client.mutate({
      mutation: updateIncidentMutation(params),
    })
    return data.updateIncident.item
  } catch (error) {
    console.log('Error:::updateIncident:::', error)

    return error
  }
}

export const resolveIncident = async (incidentId, { resolved_text }) => {
  let params = {
    id: incidentId,
    mode: 'RESOLVE',
    loggedInUserId: currentUserId,
    resolved_text: resolved_text,
  }

  params = validateAndGenerateFields(params, resolveIncidentFields)

  try {
    let { data } = await client.mutate({
      mutation: updateIncidentMutation(params),
    })

    return data.updateIncident.item
  } catch (error) {
    console.log('Error:::resolveIncident:::', error)

    return error
  }
}

export const unresolveIncident = async incidentId => {
  let params = {
    id: incidentId,
    mode: 'UNRESOLVE',
    loggedInUserId: currentUserId,
  }

  params = validateAndGenerateFields(params, resolveIncidentFields)

  try {
    let { data } = await client.mutate({
      mutation: updateIncidentMutation(params),
    })

    return data.updateIncident.item
  } catch (error) {
    console.log('Error:::unresolveIncident:::', error)

    return error
  }
}

export const closeIncident = async (incidentId, { archived_text, debrief }) => {
  let params = {
    id: incidentId,
    mode: 'CLOSE',
    loggedInUserId: currentUserId,
    archived_text: archived_text,
    debrief: debrief,
  }

  params = validateAndGenerateFields(params, closeIncidentFields)

  try {
    let { data } = await client.mutate({
      mutation: updateIncidentMutation(params),
    })

    return data.updateIncident.item
  } catch (error) {
    console.log('Error:::closeIncident:::', error)

    return error
  }
}

export const reopenIncident = async incidentId => {
  let params = {
    id: incidentId,
    mode: 'REOPEN',
    loggedInUserId: currentUserId,
  }

  params = validateAndGenerateFields(params, reopenIncidentFields)

  try {
    let { data } = await client.mutate({
      mutation: updateIncidentMutation(params),
    })

    return data.updateIncident.item
  } catch (error) {
    console.log('Error:::reopenIncident:::', error)

    return error
  }
}

export const createIncidentMessage = async (incidentId, data) => {
  let params = {
    incident_id: incidentId,
    message: data.message,
    attachment: data.attachment,
    loggedInUserId: currentUserId,
  }

  params = validateAndGenerateFields(params, createIncidentMessageFields)

  try {
    let { data } = await client.mutate({
      mutation: createIncidentMessageMutation(params),
    })

    return data.createIncidentMessage.item
  } catch (error) {
    console.log('Error:::createIncidentMessage:::', error)

    return error
  }
}
export const markIncidentAsRead = async incidentId => {
  let params = {
    incident_id: incidentId,
    loggedInUserId: currentUserId,
  }

  params = validateAndGenerateFields(params, markIncidentAsReadFields)

  try {
    let { data } = await client.mutate({
      mutation: createMarkIncidentAsReadMutation(params),
    })

    return data.createMarkIncidentAsRead.item
  } catch (error) {
    console.log('Error:::createMarkIncidentAsRead:::', error)

    return error
  }
}

export const markIncidentMessagesAsRead = async incidentId => {
  let params = {
    incident_id: incidentId,
    loggedInUserId: currentUserId,
  }

  params = validateAndGenerateFields(params, incidentMessageAsReadFields)

  try {
    let { data } = await client.mutate({
      mutation: createIncidentMessageAsReadMutation(params),
    })

    return data.createIncidentMessageAsRead.item
  } catch (error) {
    console.log('Error:::markIncidentMessagesAsRead:::', error)

    return error
  }
}
