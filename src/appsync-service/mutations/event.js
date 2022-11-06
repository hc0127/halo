import {
  updateEventMutation,
  createEventMutation,
  deleteEventsMutation,
} from '../graphql/mutations'
import { client } from '../'
import { validateAndGenerateFields } from '../utlis'

let currentUserId
try {
  const currentUser = JSON.parse(localStorage.getItem('user'))
  currentUserId = currentUser?.object_id
} catch (error) {}

const createEventFields = {
  id: true,
  zones: true,
  brief_file: true,
  capacity_counter: 'number',
  capacity_total: 'number',
  client_id: true,
  controlled_by_id: true,
  created_by_id: true,
  custom_logo_file: true,
  end_date: true,
  event_code: true,
  event_pin: true,
  import_performance_id: true,
  imported: true,
  overview: true,
  start_date: true,
  public_report: true,
  title: true,
  venue_address: true,
  venue_name: true,
  users: true,
}
const updateEventFields = {
  id: true,
  zones: true,
  brief_file: true,
  capacity_counter: 'number',
  capacity_total: 'number',
  closed: true,
  client_id: true,
  controlled_by_id: true,
  custom_logo_file: true,
  end_date: true,
  event_code: true,
  event_pin: true,
  import_performance_id: true,
  imported: true,
  overview: true,
  start_date: true,
  public_report: true,
  title: true,
  updated_by_id: true,
  venue_address: true,
  venue_name: true,
  users: true,
}
const deleteEventsFields = {
  ids: true,
  deleted_by_id: true,
}

export const updateEvent = async params => {
  params = {
    ...params,
    updated_by_id: currentUserId,
  }
  params = validateAndGenerateFields(params, updateEventFields)

  try {
    let { data } = await client.mutate({
      mutation: updateEventMutation(params),
    })

    return data.updateEvent.item
  } catch (error) {
    console.log('Error:: updateEvent:::', error)

    return error
  }
}

export const createEvent = async params => {
  params = {
    ...params,
    created_by_id: currentUserId,
  }
  params = validateAndGenerateFields(params, createEventFields)

  try {
    let { data } = await client.mutate({
      mutation: createEventMutation(params),
    })

    return data.createEvent.item
  } catch (error) {
    console.log('Error:::createEvent:::', error)

    return error
  }
}

export const closeEvent = async event_id => {
  let params = {
    id: event_id,
    closed: true,
    updated_by_id: currentUserId,
  }

  params = validateAndGenerateFields(params, updateEventFields)

  try {
    let { data } = await client.mutate({
      mutation: updateEventMutation(params),
    })

    return data.updateEvent.item
  } catch (error) {
    console.log('Error:: closeEvent:::', error)
    return error
  }
}

export const deleteEvents = async ids => {
  let params = {
    ids: ids,
    deleted_by_id: currentUserId,
  }

  params = validateAndGenerateFields(params, deleteEventsFields)

  try {
    let { data } = await client.mutate({
      mutation: deleteEventsMutation(params),
    })

    return data.deleteBatchEvents.items
  } catch (error) {
    console.log('Error:: deleteEvents:::', error)

    return error
  }
}
