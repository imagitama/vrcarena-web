import React from 'react'

import * as routes from '@/routes'
import Button from '@/components/button'
import ErrorMessage from '@/components/error-message'
import FormControls from '@/components/form-controls'

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
