import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import * as routes from '@/routes'
import { trackAction } from '@/analytics'

import Heading from '@/components/heading'
import Button from '@/components/button'

export default ({ code, message }: { code: number; message: string }) => (
  <>
    <Helmet>
      <title>Error {code || ''}</title>
      <meta name="description" content={message || 'An error has occurred.'} />
    </Helmet>
    <Heading variant="h1">{code}</Heading>
    {message}
    <br />
    <Button
      url={routes.home}
      onClick={() =>
        trackAction('ErrorView', 'Click return to home button', code)
      }>
      Return to home
    </Button>
  </>
)
