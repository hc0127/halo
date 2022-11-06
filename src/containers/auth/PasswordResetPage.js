import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Redirect } from 'react-router-dom'

import AdminField from '../../components/common/Admin/AdminField'
import Button from '../../components/common/Button/Button'
import Card from '../../components/Card'
import Title from '../../components/common/Title/Title'

import { confirmPasswordReset } from '../../api/users'

import utils from '../../utils/helpers'

export default function PasswordResetPage({
  location,
  isAlertOpen,
  toggleAlert,
}) {
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  })

  const params = new URLSearchParams(location.search)
  const token = params.get('token')
  const username = params.get('username')

  const isPasswordsEntered = Boolean(
    passwords.password && passwords.confirmPassword,
  )
  const isPasswordsEqual = passwords.password === passwords.confirmPassword

  const updateUserPassword = async () => {
    await confirmPasswordReset(passwords.password, token)
    toggleAlert(true)
  }

  return (
    <div className="password-reset--container">
      <Card>
        <Title type="h1">Reset your password for Halo</Title>
        <p className="password-reset--username">{`New password for ${username}`}</p>
        <AdminField
          type="password"
          label="New password"
          value={passwords.password}
          onChange={val =>
            setPasswords(prevState => ({ ...prevState, password: val }))
          }
          required="This field is required"
          error={
            !utils.isValidPassword(passwords.password)
              ? 'Password must be at least 8 characters, have 1 uppercase, 1 lowercase, 1 special and 1 number character.'
              : '' || !isPasswordsEqual
              ? 'Passwords do not match'
              : ''
          }
        />
        <AdminField
          type="password"
          label="Confirm password"
          value={passwords.confirmPassword}
          onChange={val =>
            setPasswords(prevState => ({ ...prevState, confirmPassword: val }))
          }
          required="This field is required"
          error={
            !utils.isValidPassword(passwords.confirmPassword)
              ? 'Password must be at least 8 characters, have 1 uppercase, 1 lowercase, 1 special and 1 number character.'
              : '' || !isPasswordsEqual
              ? 'Passwords do not match'
              : ''
          }
        />
        <Button
          disabled={!isPasswordsEntered || !isPasswordsEqual}
          style={btnStyle}
          onClick={() => updateUserPassword()}
        >
          Change password
        </Button>
        {isAlertOpen && <Redirect to="/login" />}
      </Card>
    </div>
  )
}

const btnStyle = {
  fontSize: '22px',
  color: 'white',
  padding: '10px 14px',
}

PasswordResetPage.propTypes = {
  location: PropTypes.object.isRequired,
  isAlertOpen: PropTypes.bool.isRequired,
  toggleAlert: PropTypes.func.isRequired,
}
