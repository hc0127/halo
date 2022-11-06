import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, boolean, text, number } from '@storybook/addon-knobs'
import NumberCard from '../src/components/NumberCard'

storiesOf('NumberCard', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <NumberCard
      count={number('count', 0)}
      loading={boolean('loading', false)}
      subtitle={text('subtitle', 'incidents')}
      dark={boolean('dark', false)}
    />
  ))
