import PropTypes from 'prop-types'
import { useEffect } from 'react'

const propTypes = {
  enabled: PropTypes.bool.isRequired,
}

const handleBeforeUnload = e => {
  const confirmationMessage =
    'You have unsaved changes, are you sure you want to leave?'

  e.returnValue = confirmationMessage
  return confirmationMessage
}

const WarnBeforeLeave = ({ enabled }) => {
  useEffect(() => {
    if (enabled) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled])

  return null
}

WarnBeforeLeave.propTypes = propTypes

export default WarnBeforeLeave
