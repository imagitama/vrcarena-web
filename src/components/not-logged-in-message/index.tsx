import React from 'react'
import * as routes from '../../routes'
import Button from '../button'
import ErrorMessage from '../error-message'
import FormControls from '../form-controls'

export default () => (
  <ErrorMessage>
    You need to be logged in to view this area
    <FormControls>
      <Button url={routes.login} color="secondary">
        Log In Now
      </Button>
    </FormControls>
  </ErrorMessage>
)
