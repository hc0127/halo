import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { AdminTable } from '../src/components/AdminTable'
import { BUTTON_ICONS } from '../src/utils/constants'
import { UserContext } from '../src/Contexts'

const dataRow = {
  id: '1',
  text: 'Some Text',
  stuff: 'Other Stuff',
}
const headers = ['Text', 'Stuff']
const columns = ['text', 'stuff']
const props = {
  data: new Array(100).fill().map((value, index) => ({
    id: index,
    text: `${dataRow.text} ${index}`,
    stuff: `${dataRow.stuff} ${index % 10}`,
  })),
  headers,
  columns,
  onRowClick: action('onRowClick'),
  searchPlaceholder: 'Search...',
}

storiesOf('AdminTable', module)
  .addDecorator(story => (
    <div style={{ height: 'calc(100vh - 10px)' }}>
      <UserContext.Provider value={{ get: () => 'CrestAdmin' }}>
        {story()}
      </UserContext.Provider>
    </div>
  ))
  .add('Default', () => <AdminTable {...props} />)
  .add('With Action', () => (
    <AdminTable
      {...props}
      rowActions={[
        {
          icon: BUTTON_ICONS.Dashboard,
          title: '',
          onClick: action('onDashboardClick'),
        },
      ]}
      globalActions={[
        {
          icon: BUTTON_ICONS.Delete,
          title: 'Delete',
          onClick: action('onUploadClick'),
        },
      ]}
    />
  ))
  .add('With Actions', () => (
    <AdminTable
      {...props}
      rowActions={[
        {
          icon: BUTTON_ICONS.Dashboard,
          title: '',
          onClick: action('onDashboardClick'),
        },
        {
          icon: BUTTON_ICONS.Dashboard,
          title: '',
          onClick: action('onDashboardClick'),
        },
      ]}
      globalActions={[
        {
          icon: BUTTON_ICONS.Delete,
          title: 'Delete',
          onClick: action('onUploadClick'),
        },
        {
          icon: BUTTON_ICONS.Delete,
          title: 'Delete',
          onClick: action('onUploadClick'),
        },
      ]}
    />
  ))
  .add('Custom Filter', () => (
    <AdminTable
      {...props}
      customFilter={{ column: 'stuff', label: 'Stuff', columnLabel: 'stuff' }}
    />
  ))
  .add('Custom Render', () => (
    <AdminTable
      {...props}
      customRenders={[{ column: 'text', render: row => <b>{row.text}</b> }]}
    />
  ))
