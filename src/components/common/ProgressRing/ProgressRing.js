import React from 'react'
import PropTypes from 'prop-types'

class ProgressRing extends React.Component {
  constructor(props) {
    super(props)

    const { radius, stroke } = this.props

    this.normalizedRadius = radius - stroke * 2
    this.circumference = this.normalizedRadius * 2 * Math.PI
  }

  render() {
    const { radius, stroke, strokeColour, progress } = this.props
    const strokeDashoffset =
      this.circumference - (progress / 100) * this.circumference || 0

    return (
      <svg className="ProgressRing" height={radius * 2} width={radius * 2}>
        <circle
          stroke={strokeColour}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${this.circumference} ${this.circumference}`}
          style={{ strokeDashoffset }}
          r={this.normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={strokeColour}
          fill="transparent"
          strokeWidth={1}
          r={this.normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
    )
  }
}

ProgressRing.propTypes = {
  radius: PropTypes.number,
  stroke: PropTypes.number,
  progress: PropTypes.number,
  strokeColour: PropTypes.string,
}

ProgressRing.defaultProps = {
  radius: 20,
  stroke: 3,
  progress: 50,
  strokeColour: 'white',
}

export default ProgressRing
