import React from 'react'
import PropTypes from 'prop-types'
import { Loading } from './common'

const propTypes = {
  count: PropTypes.number,
  loading: PropTypes.bool,
  subtitle: PropTypes.string,
  dark: PropTypes.bool,
}

const NumberCard = ({ count, loading, subtitle, dark, ...props }) => {
  let countString = count.toString()
  if (countString.length < 2) countString = `0${countString}`
  return (
    <div
      className={`number-card ${dark ? 'number-card--dark' : ''}`}
      {...props}
    >
      <div className="number-card__container">
        {(loading && <Loading />) || (
          <p className="number-card__number">{countString}</p>
        )}
        <p className="number-card__subtitle">{subtitle}</p>
      </div>
    </div>
  )
}

NumberCard.propTypes = propTypes

NumberCard.defaultProps = {
  count: 0,
  loading: false,
  subtitle: '',
  dark: false,
}

export default NumberCard
