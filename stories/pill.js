import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, radios } from '@storybook/addon-knobs'
import { PILL_VARIANT } from '../src/utils/constants'
import Pill from '../src/components/common/Pill'

storiesOf('Pill', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <Pill
      variant={radios(
        'variant',
        Object.values(PILL_VARIANT),
        PILL_VARIANT.Suspended,
      )}
    />
  ))
