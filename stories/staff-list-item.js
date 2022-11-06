import React from 'react'
import moment from 'moment'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean, radios, text } from '@storybook/addon-knobs'
import StaffListItem from '../src/components/StaffListItem'

const dummyUser = date => ({
  updatedAt: date,
  get: field =>
    ({
      updatedAt: date,
      pin: radios(
        'pin type',
        [
          'standard',
          'admin',
          'fire',
          'medic',
          'leadcar',
          'housekeeping',
          'police',
        ],
        'police',
      ),
      customPinFile: null,
      name: text('name', 'John Doe'),
      role: text('role', 'example'),
    }[field]),
})

storiesOf('StaffListItem', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <StaffListItem
      user={dummyUser(new Date())}
      onClick={action('onClick')}
      bookedOn={boolean('bookedOn', true)}
    />
  ))
  .add('no update', () => (
    <StaffListItem
      user={dummyUser(
        moment()
          .add(-30, 'minutes')
          .toDate(),
      )}
      onClick={action('onClick')}
      bookedOn={boolean('bookedOn', true)}
    />
  ))
