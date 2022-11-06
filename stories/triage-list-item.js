import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { withKnobs } from '@storybook/addon-knobs'
import IncidentTriagingListItem from '../src/components/IncidentTriagingListItem'
import { CustomIncidentTypesContext } from '../src/Contexts'

const dummyIncident = {
  createdAt: new Date(),
  get: field =>
    ({
      typeValue: '{type}',
      reportedBy: {
        get: innerField => ({ name: '{name}', role: '{role}' }[innerField]),
      },
    }[field]),
}

storiesOf('Incident Triage List Item', module)
  .addDecorator(withKnobs)
  .addDecorator(story => (
    <CustomIncidentTypesContext.Provider value={[]}>
      {story()}
    </CustomIncidentTypesContext.Provider>
  ))
  .add('Default', () => (
    <IncidentTriagingListItem
      incident={dummyIncident}
      onClick={action('onClick')}
    />
  ))
