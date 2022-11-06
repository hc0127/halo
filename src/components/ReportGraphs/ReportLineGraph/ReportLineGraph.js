import React, { useEffect } from 'react'
import propTypes from 'prop-types'
import { connect } from 'react-redux'
import { Line } from 'react-chartjs-2'

import Heading from '../../../components/common/Heading/Heading'
import { loadCapacityHistory } from '../../../stores/ReduxStores/dashboard/capacityHistory'
import Loading from '../../common/Loading/Loading'

const ReportLineGraph = ({ dispatch, capacityHistory, loading }) => {
  useEffect(() => {
    dispatch(loadCapacityHistory())
    return
  }, [dispatch])

  const capacityHistoryData = {
    datasets: [
      {
        label: 'Counter',
        backgroundColor: 'rgba(220,220,220,0.2)',
        borderColor: 'rgba(220,220,220,1)',
        data: capacityHistory.map(hist => hist.capacity_counter),
      },
      {
        label: 'Total',
        backgroundColor: 'rgba(151,187,205,0.2)',
        borderColor: 'rgba(151,187,205,1)',
        data: capacityHistory.map(hist => hist.capacity_counter),
      },
    ],
    labels: capacityHistory.map(
      hist =>
        `${new Date(hist.created_at).toLocaleDateString('en-GB')} ${new Date(
          hist.created_at,
        )
          .toTimeString()
          .substring(0, 2)}h`,
    ),
  }

  return (
    <div>
      {loading && (
        <>
          <h4>Loading Capacity vs Time graph</h4>
          <Loading />
        </>
      )}
      {capacityHistory.length > 0 && (
        <div>
          <Heading size="h3" text="Capacity vs Time graph" />
          <div style={{ width: 'calc(99vw - 50px)', maxWidth: '21cm' }}>
            <Line
              height={700}
              width={1200}
              data={capacityHistoryData}
              options={{
                responsive: true,
                scales: {
                  yAxes: [
                    {
                      ticks: {
                        beginAtZero: true,
                      },
                    },
                  ],
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

ReportLineGraph.propTypes = {
  capacityHistory: propTypes.any.isRequired,
  loading: propTypes.any.isRequired,
  dispatch: propTypes.func.isRequired,
}

ReportLineGraph.defaultProps = {}

export default connect(state => ({
  capacityHistory: state.capacityHistory.list,
  loading: state.capacityHistory.status === 'loading',
}))(ReportLineGraph)
