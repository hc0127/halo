import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, boolean, text } from '@storybook/addon-knobs'
import AdminCard from '../src/components/common/Admin/AdminCard'
import AdminCardBody from '../src/components/common/Admin/AdminCardBody'

storiesOf('AdminCard', module)
  .addDecorator(story => <div style={{ backgroundColor: '' }}>{story()}</div>)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <AdminCard title={text('title', 'Title')}>
      <AdminCardBody
        thin={boolean('thin', false)}
        nopadding={boolean('no padding', false)}
      >
        {text('content', 'Content')}
      </AdminCardBody>
    </AdminCard>
  ))
