import React from 'react'
import { Helmet } from 'react-helmet'
import Heading from '../../components/heading'
import Button from '../../components/button'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'

export default ({ code, message }) => (
  <>
    <Helmet>
      <title>Error {code || ''} | VRCArena</title>
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
