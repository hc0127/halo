import { client } from '..'
import { getEventsQuery, getEventQuery } from '../graphql/queries'
import { getCurrentUser } from './../../utils//helpers'

export const getEvents = async (offset = 0, limit = 300, sort = 'DESC') => {
  try {
    const { object_id: currentUserId } = getCurrentUser()

    let { data } = await client.query({
      query: getEventsQuery,
      variables: { offset, limit, sort, loggedInUserId: currentUserId },
      fetchPolicy: 'network-only',
    })

    return data.getEvents
  } catch (error) {
    console.log('Error while getting Events:::', error)
    return error
  }
}

export const getEvent = async id => {
  try {
    const { object_id: currentUserId } = getCurrentUser()

    let { data } = await client.query({
      query: getEventQuery,
      variables: { id, loggedInUserId: currentUserId },
      fetchPolicy: 'network-only',
    })

    return data.getEvent.item
  } catch (error) {
    console.log('Error while getting Event:::', error)
    return error
  }
}
