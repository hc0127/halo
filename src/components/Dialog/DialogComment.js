import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import DashboardButton from '../DashboardButton'
import { VARIANT } from '../../utils/constants'
import { commentDialog } from '../../stores/ReduxStores/dashboard/dashboard'

const propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  buttonText: PropTypes.string,
  required: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
}

const DialogComment = ({
  title,
  message,
  buttonText,
  required,
  onClose,
  dispatch,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [comment, setComment] = useState('')

  const isValid = useMemo(() => {
    if (submitting) {
      return false
    }

    return !required || comment
  }, [required, submitting, comment])

  const onSubmit = useCallback(() => {
    if (!isValid) {
      return
    }

    setSubmitting(true)
    dispatch(commentDialog(comment))
  }, [dispatch, setSubmitting, isValid, comment])

  return (
    <div className="dialog-comment">
      <h2>{title}</h2>
      <p>{message}</p>
      <div>
        <textarea
          autoFocus /* eslint-disable-line */
          placeholder={'Details' + (required ? '' : ' (Optional)')}
          className="dialog-comment__textarea"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </div>

      <div className="dialog__button-bar">
        <DashboardButton onClick={onClose} variant={VARIANT.Secondary}>
          Cancel
        </DashboardButton>
        <DashboardButton onClick={onSubmit} disabled={!isValid}>
          {buttonText || 'Submit'}
        </DashboardButton>
      </div>
    </div>
  )
}

DialogComment.propTypes = propTypes

DialogComment.defaultProps = {
  message: '',
  buttonText: '',
}

export default DialogComment
