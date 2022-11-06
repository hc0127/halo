import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, radios, text } from '@storybook/addon-knobs'
import { ChatBubble } from '../src/components/common'

storiesOf('ChatBubble', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <ChatBubble
      name={text('name', '{name}')}
      text={text('text', 'Lorem Ipsum')}
      date={new Date()}
      side={radios('Side', ['left', 'right'], 'right')}
      attachment={null}
    />
  ))
