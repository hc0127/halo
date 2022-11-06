import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs, boolean, radios, text } from '@storybook/addon-knobs'
import { VARIANT } from '../src/utils/constants'
import { AdminField } from '../src/components/common/Admin'

storiesOf('AdminField', module)
  .addDecorator(withKnobs)
  .addDecorator(story => <div style={{ margin: 32 }}>{story()}</div>)
  .add('Default', () => (
    <AdminField
      label={text('label', 'label')}
      type={radios(
        'type',
        [
          'switch',
          'textarea',
          'number',
          'file',
          'date',
          'datetime',
          'dropdown',
          'react-select',
          'text',
        ],
        'text',
      )}
      placeholder={text('placeholder', 'placeholder')}
      disabled={boolean('disabled', false)}
      variant={radios(
        'variant',
        [VARIANT.Primary, VARIANT.Secondary],
        VARIANT.Primary,
      )}
      required={boolean('required', false)}
      error={text('error', '')}
      tooltip={text('tooltip', '')}
      onBlur={action('onBlur')}
      onFocus={action('onFocus')}
      onChange={action('onChange')}
      onEnter={action('onEnter')}
      options={[
        { value: 'value1', label: 'label1' },
        { value: 'value2', label: 'label2' },
      ]}
    />
  ))
