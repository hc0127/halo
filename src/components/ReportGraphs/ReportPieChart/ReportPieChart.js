import React from 'react'
import propTypes from 'prop-types'
import { Pie } from 'react-chartjs-2'

const ReportPieChart = ({ incidentCountByType }) => (
  <div>
    {incidentCountByType.labels.length > 0 && (
      <div className="PieAndLegend">
        <div>
          <Pie
            data={incidentCountByType}
            height={450}
            width={600}
            options={{
              legend: {
                position: 'right',
                verticalAlign: 'center',
                labels: {
                  usePointStyle: true,
                  fontSize: 16,
                  generateLabels: chart => {
                    const { data: datasets } = chart
                    if (datasets.labels.length && datasets.datasets.length) {
                      return datasets.labels.map((label, index) => {
                        const meta = chart.getDatasetMeta(0)
                        const dataset = datasets.datasets[0]
                        const data = meta.data[index]
                        const custom = (data && data.custom) || {}
                        const {
                          getValueAtIndexOrDefault,
                        } = window.Chart.helpers
                        const arcOpts = chart.options.elements.arc
                        const fill = custom.backgroundColor
                          ? custom.backgroundColor
                          : getValueAtIndexOrDefault(
                              dataset.backgroundColor,
                              index,
                              arcOpts.backgroundColor,
                            )
                        const stroke = custom.borderColor
                          ? custom.borderColor
                          : getValueAtIndexOrDefault(
                              dataset.borderColor,
                              index,
                              arcOpts.borderColor,
                            )
                        const bw = custom.borderWidth
                          ? custom.borderWidth
                          : getValueAtIndexOrDefault(
                              dataset.borderWidth,
                              index,
                              arcOpts.borderWidth,
                            )

                        // We get the value of the current label
                        const value =
                          chart.config.data.datasets[data._datasetIndex].data[
                            data._index
                          ]

                        return {
                          // Instead of `text: label,`
                          // We add the value to the string
                          text: `${label} : ${value}`,
                          fillStyle: fill,
                          strokeStyle: stroke,
                          lineWidth: bw,
                          hidden:
                            Number.isNaN(dataset.data[index]) ||
                            meta.data[index].hidden,
                          index,
                        }
                      })
                    }
                    return []
                  },
                },
              },
            }}
          />
        </div>
      </div>
    )}
  </div>
)

ReportPieChart.propTypes = {
  incidentCountByType: propTypes.any.isRequired,
}

ReportPieChart.defaultProps = {}

export default ReportPieChart
