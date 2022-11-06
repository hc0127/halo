import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'

import {
  AdminField,
  AdminPinDropdown,
  AdminButton,
} from '../src/components/common/Admin'
import {
  AdminForm,
  AdminFormRow,
  AdminFormColumn,
} from '../src/components/AdminForm'

storiesOf('AdminForm', module)
  .addDecorator(withKnobs)
  .addDecorator(story => <div style={{ margin: 32 }}>{story()}</div>)
  .add('Client', () => (
    <AdminForm>
      <AdminFormColumn size={3}>
        <AdminFormRow>
          <AdminField
            label="Company Name"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow size={2}>
          <AdminField
            label="Address"
            value=""
            type="textarea"
            onChange={() => {}}
          />
        </AdminFormRow>
      </AdminFormColumn>
      <AdminFormColumn size={2}>
        <AdminFormRow>
          <AdminField
            label="Contact name"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField label="email" value="" type="text" onChange={() => {}} />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField label="phone" value="" type="text" onChange={() => {}} />
        </AdminFormRow>
      </AdminFormColumn>
      <AdminFormColumn>
        <AdminFormRow>
          <AdminField
            label="Licence expiry"
            value={null}
            type="date"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField
            label="Event Limit"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField
            label="people Limit"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
      </AdminFormColumn>
    </AdminForm>
  ))
  .add('Event', () => (
    <AdminForm>
      <AdminFormColumn size={2}>
        <AdminFormRow>
          <AdminField
            label="Event Name"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow size={2}>
          <AdminField
            label="Venue address"
            value=""
            type="textarea"
            onChange={() => {}}
          />
        </AdminFormRow>
      </AdminFormColumn>
      <AdminFormColumn>
        <AdminFormRow>
          <AdminField
            label="Start Date"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField
            label="End Date"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField label="Pin" value="" type="text" onChange={() => {}} />
        </AdminFormRow>
      </AdminFormColumn>
      <AdminFormColumn size={2}>
        <AdminFormRow size={3}>
          <AdminField
            label="Event Overview"
            value=""
            type="textarea"
            onChange={() => {}}
          />
        </AdminFormRow>
      </AdminFormColumn>
      <AdminFormColumn>
        <AdminFormRow>
          <AdminField
            label="Estimated capacity"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField
            label="event code"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField label="Brief" value="" type="text" onChange={() => {}} />
        </AdminFormRow>
      </AdminFormColumn>
    </AdminForm>
  ))
  .add('Users', () => (
    <AdminForm>
      <AdminFormColumn size={2}>
        <AdminFormRow>
          <AdminField
            label="Username"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField
            label="Fullname"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
        <AdminFormRow>
          <div className="admin-user__password-container">
            <AdminField
              label="Password"
              type="text"
              value="1"
              onChange={() => {}}
              required="Please enter password."
              error={
                true &&
                'Password must be at least 8 characters, have 1 uppercase, 1 lowercase, 1 special and 1 number character'
              }
            />
            <AdminButton hollow onClick={() => this.generatePassword()}>
              Generate
            </AdminButton>
          </div>
        </AdminFormRow>
      </AdminFormColumn>
      <AdminFormColumn>
        <AdminFormRow>
          <AdminField label="Email" value="" type="text" onChange={() => {}} />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField label="Phone" value="" type="text" onChange={() => {}} />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField label="Role" value="" type="text" onChange={() => {}} />
        </AdminFormRow>
      </AdminFormColumn>
      <AdminFormColumn>
        <AdminFormRow>
          <AdminPinDropdown
            value="custom"
            onChange={() => {}}
            onFileSelection={() => {}}
            fullName="Simon Smith"
          />
        </AdminFormRow>
        <AdminFormRow>
          <AdminField
            label="Permission"
            value=""
            type="text"
            onChange={() => {}}
          />
        </AdminFormRow>
      </AdminFormColumn>
    </AdminForm>
  ))
