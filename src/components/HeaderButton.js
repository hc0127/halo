import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Icon, Button } from './common'
import { getIcon } from '../stores/IconStore'

const propTypes = {
  action: PropTypes.shape({
    type: PropTypes.string.isRequired,
    payload: PropTypes.any,
  }).isRequired,
  icon: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  children: PropTypes.string.isRequired,
}

const HeaderButton = ({ action, icon, dispatch, children }) => (
  <div className="header-button">
    <Button
      onClick={() => {
        dispatch(action)
      }}
      size="sm"
      margin="0px 10px"
      tabIndex={-1}
    >
      <i>
        <Icon
          src={getIcon(icon)}
          size={30}
          backgroundColor="#FFF400"
          borderRadius="50%"
        />
      </i>
      <span>{children}</span>
    </Button>
  </div>
)

HeaderButton.propTypes = propTypes

HeaderButton.defaultProps = {}

export default connect()(HeaderButton)
