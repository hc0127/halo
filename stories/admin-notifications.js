import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, number } from '@storybook/addon-knobs'
import AdminNotifications from '../src/components/common/Admin/AdminNotifications'

storiesOf('Notifications', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <AdminNotifications
      notifications={new Array(number('notifications', 0))
        .fill()
        .map(index => ({ message: `Notification Example ${index}` }))}
    />
  ))
