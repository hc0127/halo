import React, { Fragment } from 'react'
import Parse from 'parse'
import moment from 'moment'
import PropTypes from 'prop-types'
import Image from '../common/Image/Image'
import utils from '../../utils/helpers'
import ClickableDiv from '../ClickableDiv'
import Icon from '../common/Icon'
import { BUTTON_ICONS } from '../../utils/constants'

const propTypes = {
  ban: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  hasPermission: PropTypes.bool.isRequired,
}

const fieldsToShow = [
  'gender',
  'age',
  'height',
  'ethnicity',
  'distinguish_features',
  'ticket_information',
  'street',
  'town',
  'county',
  'post_code',
  'ban_type',
  'banned_on',
  'banned_until',
  'capture_data',
  'reason',
]

const BanListItem = ({ ban, onEdit, onDelete, hasPermission }) => (
  <div className="ban-list__item">
    <h3>
      {ban.capture_data.firstName} {ban.capture_data.lastName}
      {hasPermission && (
        <div className={utils.makeClass(['ban-list', 'item', 'actions'])}>
          <ClickableDiv onClick={onEdit}>
            <Icon icon={BUTTON_ICONS.EditBan} />
          </ClickableDiv>
          <ClickableDiv onClick={onDelete}>
            <Icon icon={BUTTON_ICONS.DeleteBan} />
          </ClickableDiv>
        </div>
      )}
    </h3>

    <div className="ban-list__item__content">
      {ban.img_file && (
        <div className="ban-list__item__image">
          <Image src={window.getFileDefaultUrl() + ban.img_file} alt="" />
        </div>
      )}
      <div className="ban-list__item__details">
        {Object.values(ban.fieldsToShow).map(field => (
          <Fragment key={field.header}>
            <div className="ban-list__item__details__title">{field.header}</div>
            <div
              className={
                field.header === 'Banned Untill:' &&
                moment(field.data).isAfter(moment())
                  ? 'red'
                  : ''
              }
            >
              {field.data ?? 'Unspecified'}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  </div>
)

BanListItem.propTypes = propTypes

export default BanListItem
