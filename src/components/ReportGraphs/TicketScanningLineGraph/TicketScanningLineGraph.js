import React, { useEffect, useState } from 'react'
import propTypes from 'prop-types'
import { connect } from 'react-redux'
import { Line } from 'react-chartjs-2'
import Heading from '../../common/Heading/Heading'
import { loadTicketScanningLogs } from '../../../stores/ReduxStores/dashboard/ticketScanningLogs'
import moment from 'moment'
import Loading from '../../common/Loading/Loading'
import {
  TICKET_SCANNING_FILTERS,
  FILTER_DATE_FORMAT,
} from '../../../utils/constants'

const filterData = ({ ticketScanningLogs, chartFilterBy }) => {
  return ticketScanningLogs.filter(ticket => {
    if (chartFilterBy === 'event') {
      return true
    }

    const today = moment()
      .startOf('day')
      .valueOf()
    const ticketDate = moment(ticket.updated_at)
      .startOf('day')
      .valueOf()

    if (chartFilterBy === 'today' && today === ticketDate) {
      return true
    }

    if (
      chartFilterBy === 'lastFifteen' &&
      moment().diff(ticket.updated_at, 'minutes') <= 15
    ) {
      return true
    }

    return false
  })
}

const getTimeInterval = chartFilterBy => {
  if (chartFilterBy === 'event') {
    return 1000 * 60 * 60
  }

  if (chartFilterBy === 'lastFifteen') {
    return 1000 * 60 * 3
  }

  return 1000 * 60 * 15
}

const getRoundedDate = ({ date, interval }) => {
  return moment(
    new Date(Math.round(new Date(date).getTime() / interval) * interval),
  )
}

const parseChartReportData = ({
  ticketScanningLogs,
  chartFilterBy = 'today',
}) => {
  const ticketsByTime = getIntervalsBetweenDates({
    ticketScanningLogs,
    chartFilterBy,
  })
    

  filterData({ ticketScanningLogs, chartFilterBy }).forEach(ticket => {
    // const ticketDirection = ticket.parameters.entering ? 'entering' : 'exiting'
    const ticketDirection = ticket.status=="ticket_accepted"? 'entering' : 'exiting'
    let timeInterval = getTimeInterval(chartFilterBy)
    const date = ticket.updated_at
    let roundedDate = moment(
      new Date(
        Math.round(new Date(date).getTime() / timeInterval) * timeInterval,
      ),
    )

    if (chartFilterBy === 'event') {
      roundedDate = roundedDate.format('DD/MM/YYYY HH:mm')
    } else {
      roundedDate = roundedDate.format('HH:mm')
    }

    if (ticketsByTime[roundedDate]) {
      ticketsByTime[roundedDate][ticketDirection] =
        ticketsByTime[roundedDate][ticketDirection] + 1
    } else {
      ticketsByTime[roundedDate] = {
        datetime: roundedDate,
        entering: 0,
        exiting: 0,
      }
      ticketsByTime[roundedDate][ticketDirection] = 1
    }
  })

  return {
    datasets: [
      {
        label: 'Tickets In',
        borderColor: 'rgba(58, 75, 193, 1)',
        data: Object.values(ticketsByTime).map(time => time.entering),
      },
      {
        label: 'Tickets Out',
        borderColor: 'rgba(42, 213, 135, 1)',
        data: Object.values(ticketsByTime).map(time => time.exiting),
      },
    ],
    labels: Object.keys(ticketsByTime).map(time => time),
  }
}

const getStartAndEndTimes = ({
  ticketScanningLogs,
  chartFilterBy,
  interval,
}) => {
  if (chartFilterBy === TICKET_SCANNING_FILTERS.lastFifteen) {
    return {
      start: moment().subtract(15, 'minutes'),
      end: moment(),
    }
  }

  if (!ticketScanningLogs.length) {
    return { start: null, end: null }
  }

  const ticketData = filterData({ ticketScanningLogs, chartFilterBy })

  if (!ticketData.length) {
    return { start: null, end: null }
  }

  const firstTicket = ticketData[0]
  const lastTicket = ticketData[ticketData.length - 1]
  return {
    start: moment(getRoundedDate({ date: firstTicket.updated_at, interval })),
    end: moment(getRoundedDate({ date: lastTicket.updated_at, interval })),
  }
}

const getIntervalsBetweenDates = ({ ticketScanningLogs, chartFilterBy }) => {
  const interval = getTimeInterval(chartFilterBy)
  const { start, end } = getStartAndEndTimes({
    ticketScanningLogs,
    chartFilterBy,
    interval,
  })

  const startDate = moment(start).valueOf()
  const endDate = moment(end).valueOf()
  let currentInterval = startDate

  const times = []

  while (currentInterval <= endDate) {
    const fullDate = moment(currentInterval).format('DD/MM/YYYY HH:mm')
    const date = moment(currentInterval).format(
      FILTER_DATE_FORMAT[chartFilterBy],
    )

    times[date] = { datetime: fullDate, entering: 0, exiting: 0 }

    currentInterval = currentInterval + interval
  }

  return times
}

const TicketScanningLineGraph = ({
  ticketScanning,
  chartFilterBy,
  showTitle,
  loading,
  dispatch,
}) => {
  let ticket=[]
  ticketScanning && ticketScanning.forEach(log => {
    log.logs && log.logs.forEach(item => {
      ticket.push(item)
    })
  })
  useEffect(() => {
    dispatch(loadTicketScanningLogs())
  }, [dispatch])
 
  const ticketScanningData = parseChartReportData({
    ticketScanningLogs: ticket,
    chartFilterBy,
  })

  return (
    <>
      {loading && (
        <>
          <h4>Loading Entries over time graph</h4>
          <Loading />
        </>
      )}
      {ticketScanning.length > 0 && (
        <div
          className="ticket-scanning-line-graph"
          style={{ maxWidth: '100vw' }}
        >
          {showTitle && (
            <Heading
              size="h3"
              className="ticket-scanning-line-graph__header"
              text="Entries Over Time"
              margin="15px 0"
            />
          )}
          <Line
            height={700}
            width={1200}
            data={ticketScanningData}
            options={{
              legend: {
                position: 'bottom',
              },
              elements: {
                line: {
                  fill: false,
                  tension: 0,
                },
              },
              xAxisID: 'Label X',
              yAxisID: 'Label Y',
              responsive: true,
              scales: {
                yAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      labelString: 'Tickets Scanned',
                    },
                    ticks: {
                      precision: 0,
                      beginAtZero: true,
                    },
                  },
                ],
              },
            }}
          />
        </div>
      )}
    </>
  )
}

TicketScanningLineGraph.propTypes = {
  ticketScanning: propTypes.any.isRequired,
  chartFilterBy: propTypes.string.isRequired,
  showTitle: propTypes.bool,
  loading: propTypes.bool.isRequired,
  dispatch: propTypes.func.isRequired,
}

TicketScanningLineGraph.defaultProps = {
  showTitle: false,
}

export default connect(state => ({
  ticketScanning: state.ticketScanningLogs.data,
  loading: state.ticketScanningLogs.status === 'loading',
}))(TicketScanningLineGraph)
