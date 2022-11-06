import { client } from '..'
import {
  getIncidentsQuery,
  getIncidentMessagesQuery,
  getClosedIncidentsQuery,
} from '../graphql/queries'

export const getEventIncidents = async (
  eventId,
  offset = 0,
  limit = 300,
  sort = 'DESC',
) => {
  try {
    let { data } = await client.query({
      query: getIncidentsQuery,
      variables: { eventId, offset, limit, sort },
      fetchPolicy: 'network-only',
    })

    return data.getIncidents
  } catch (error) {
    console.log('Error while getting EventIncidents:::', error)
    return error
  }
}

export const getClosedIncidents = async (
  eventId,
  offset = 0,
  limit = 300,
  sort = 'DESC',
) => {
  try {
    let { data } = await client.query({
      query: getClosedIncidentsQuery,
      variables: { eventId, offset, limit, sort },
      fetchPolicy: 'network-only',
    })

    return data.getClosedIncidents
  } catch (error) {
    console.log('Error while getting EventIncidents:::', error)
    return error
  }
}

export const getIncidentMessages = async (
  incidentId,
  offset = 0,
  limit = 1000,
  sort = 'ASC',
) => {
  try {
    let { data } = await client.query({
      query: getIncidentMessagesQuery,
      variables: { incidentId, offset, limit, sort },
      fetchPolicy: 'network-only',
    })

    return data.getIncidentMessages.items
  } catch (error) {
    console.log('Error while getting IncidentMessages:::', error)
    return error
  }
}
