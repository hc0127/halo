import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, number } from '@storybook/addon-knobs'

import AdminTabCard from '../src/components/common/Admin/AdminTabCard'
import AdminTabTitle from '../src/components/common/Admin/AdminTabTitle'
import AdminTabContent from '../src/components/common/Admin/AdminTabContent'

import { generate } from 'shortid'

storiesOf('AdminTabs', module)
  .addDecorator(withKnobs)
  .add('Default', () => {
    const count = number('tabCount', 2)
    const tabCountArray = new Array(count).fill()

    return (
      <AdminTabCard>
        {tabCountArray.map((_, index) => (
          <AdminTabTitle key={generate()}>title{index}</AdminTabTitle>
        ))}
        {tabCountArray.map((_, index) => (
          <AdminTabContent key={generate()}>Content{index}</AdminTabContent>
        ))}
      </AdminTabCard>
    )
  })
