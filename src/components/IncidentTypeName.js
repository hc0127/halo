import React from 'react'
import PropTypes from 'prop-types'
import Parse from 'parse'
import utils from '../utils/helpers'
import { withCustomIncidentTypesContext } from '../Contexts'

const propTypes = {
  customIncidentTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  children: PropTypes.instanceOf(Parse.Object).isRequired,
}

const IncidentTypeName = ({ children: incident, customIncidentTypes }) => (
  <>{utils.getIncidentName(incident.type_value, customIncidentTypes)}</>
)

IncidentTypeName.propTypes = propTypes

IncidentTypeName.defaultProps = {}

export default withCustomIncidentTypesContext(IncidentTypeName)
