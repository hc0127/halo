import React from 'react'
import { storiesOf } from '@storybook/react'
import AdminSavePanel from '../src/components/common/Admin/AdminSavePanel'
import AdminButton from '../src/components/common/Admin/AdminButton'

storiesOf('AdminSavePanel', module).add('Default', () => (
  <AdminSavePanel>
    <AdminButton>Save</AdminButton>
  </AdminSavePanel>
))
