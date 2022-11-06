import React, { useEffect, useMemo } from 'react'
import Parse from 'parse'
import PropTypes from 'prop-types'
import BanListItem from './BanListItem'
import BanListTable from './BanListTable'
import { USER_PERMISSIONS } from '../../utils/constants'
import { getDaysInMonth, getDaysInYear } from '../../utils/helpers'
import { Loading } from '../common'
import { useSelector, useDispatch } from 'react-redux'

import { loadIncidents } from '../../stores/ReduxStores/dashboard/incidents'

const propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  permission: PropTypes.string.isRequired,
}

const BanList = ({ onEdit, onDelete, permission }) => {
  const dispatch = useDispatch()
  const incidents = useSelector(state => state.incidents)
  const incidentsLoading = useSelector(
    state => state.incidents.status === 'loading',
  )

  const ejectionIncidents = useMemo(() => {
    const incidentsData = Object.values(incidents.data)

    return incidentsData
      .filter(item => item.type_value === 'ejection')
      .map(item => {
        const { capture_data } = item ?? {}

        const {
          gender,
          age,
          height,
          ethnicOrigin,
          distinguish_features,
          ticket_information,
          street,
          town,
          county,
          post_code,
          banType,
          banDuration,
          banTerm,
          marks,
        } = capture_data ?? {}
        const now = new Date()

        let banned_untill = +new Date(item.created_at)
        switch (banTerm) {
          case 'hours':
            banned_untill += banDuration * 60 * 60 * 1000
            break
          case 'days':
            banned_untill += banDuration * 24 * 60 * 60 * 1000
            break
          case 'months':
            banned_untill +=
              banDuration *
              getDaysInMonth(now.getFullYear(), now.getMonth() + 1, 0) *
              24 *
              60 *
              60 *
              1000
            break
          default:
            banned_untill +=
              Array.from(Array(parseInt(banDuration)).keys()).reduce(
                (res, year) => (res += getDaysInYear(year + 1)),
                0,
              ) *
              24 *
              60 *
              60 *
              1000
        }

        return {
          ...item,
          fieldsToShow: {
            gender: {
              header: 'Gender:',
              data: gender === 'male' ? 'M' : 'F',
            },
            age: {
              header: 'Age:',
              data: age,
            },
            height: {
              header: 'Height:',
              data: height,
            },
            ethnicity: {
              header: 'Ethnicity:',
              data: ethnicOrigin,
            },
            distinguish_features: {
              header: 'Distinguish Features:',
              data: distinguish_features,
            },
            ticket_information: {
              header: 'Ticket Information:',
              data: ticket_information,
            },
            street: {
              header: 'Street:',
              data: street,
            },
            town: {
              header: 'Town:',
              data: town,
            },
            country: {
              header: 'Country:',
              data: county,
            },
            post_code: {
              header: 'Post Code:',
              data: post_code,
            },
            ban_type: {
              header: 'Ban Type:',
              data: banType,
            },
            banned_on: {
              header: 'Banned On:',
              data: new Date(item.created_at).toLocaleString(),
            },
            banned_untill: {
              header: 'Banned Untill:',
              data: new Date(banned_untill).toLocaleString(),
            },
            reason: {
              header: 'Reason:',
              data: marks,
            },
          },
        }
      })
  }, [incidents])

  const customEjection = ejectionIncidents.map(item => ({
    ...item,
    selected: false,
  }))
  useEffect(() => {
    dispatch(loadIncidents())
  }, [dispatch])

  return (
    <div className="ban-list">
      <BanListTable ejectItem={customEjection ?? []} onEdit={onEdit} />
      {/* {(ejectionIncidents ?? []).map(ban => (
          <BanListItem
            ban={ban}
            key={ban.object_id}
            hasPermission={
              permission === USER_PERMISSIONS.ClientManager ||
              permission === USER_PERMISSIONS.CrestAdmin
            }
            onEdit={() => onEdit(ban.object_id)}
            onDelete={() => onDelete(ban.object_id)}
          />
        ))} */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {customEjection.length === 0 && !incidentsLoading && 'No Incidents'}
        {incidentsLoading && <Loading />}
      </div>
    </div>
  )
}

BanList.propTypes = propTypes

export default BanList
