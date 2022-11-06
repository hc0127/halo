import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { connect } from 'react-redux'
import { loadServerTime } from '../stores/ReduxStores/dashboard/serverTime'
import { useInterval } from '../utils/customHooks'
import { Loading } from './common'

const propTypes = {
  serverTime: PropTypes.instanceOf(moment),
  dispatch: PropTypes.func.isRequired,
}

const CurrentTimeDisplay = ({ serverTime, dispatch }) => {
  const [diff, setDiff] = useState(0)
  const [date, setDate] = useState(moment())

  useInterval(() => {
    setDate(moment())
  }, 250)

  useEffect(() => {
    const ms = serverTime
      ? moment.duration(moment().diff(moment(serverTime))).asMilliseconds()
      : 0
    setDiff(ms)
  }, [serverTime])

  useEffect(() => {
    dispatch(loadServerTime())
    return () => {}
  }, [dispatch])

  return (
    <>
      {!serverTime ? (
        <Loading />
      ) : (
        date.add(diff, 'milliseconds').format('DD/MM/YYYY HH:mm')
      )}
    </>
  )
}

CurrentTimeDisplay.propTypes = propTypes

CurrentTimeDisplay.defaultProps = {
  serverTime: null,
}

export default connect(state => ({ serverTime: state.serverTime.value }))(
  CurrentTimeDisplay,
)
