import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean, radios, text } from '@storybook/addon-knobs'
import AdminButton from '../src/components/common/Admin/AdminButton'
import { VARIANT, BUTTON_ICONS } from '../src/utils/constants'
import ButtonWithIcon from '../src/components/common/ButtonWithIcon'
import DashboardButton from '../src/components/DashboardButton'
import HeaderButton from '../src/components/HeaderButton'

storiesOf('Buttons/AdminButton', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <AdminButton
      onClick={action('onClick')}
      variant={radios(
        'Variant',
        [VARIANT.Primary, VARIANT.Secondary],
        VARIANT.Primary,
      )}
      hollow={boolean('Hollow', false)}
      loading={boolean('Loading', false)}
      disabled={boolean('Disabled', false)}
    >
      Primary
    </AdminButton>
  ))

storiesOf('Buttons/ButtonWithIcon', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <ButtonWithIcon
      icon={BUTTON_ICONS.Copy}
      onClick={action('onClick')}
      variant={radios(
        'Variant',
        [VARIANT.Primary, VARIANT.Secondary],
        VARIANT.Primary,
      )}
      hollow={boolean('Hollow', false)}
      disabled={boolean('Disabled', false)}
      title={text('Title', 'Button')}
      wide={boolean('Wide', false)}
    />
  ))

storiesOf('Buttons/DashboardButton', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <DashboardButton
      variant={radios(
        'Variant',
        [VARIANT.Primary, VARIANT.Secondary],
        VARIANT.Primary,
      )}
      loading={boolean('loading', false)}
      disabled={boolean('disabled', false)}
    >
      {text('title', 'Button')}
    </DashboardButton>
  ))

storiesOf('Buttons/HeaderButton', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <HeaderButton
      icon={radios(
        'icon',
        ['evacuate', 'lockdown', 'message', 'unread'],
        'evacuate',
      )}
    >
      {text('title', 'Button')}
    </HeaderButton>
  ))
