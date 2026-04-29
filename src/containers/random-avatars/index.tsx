import React from 'react'

import { routes } from '@/routes'

import Heading from '@/components/heading'
import Link from '@/components/link'
import WarningMessage from '@/components/warning-message'

export default () => {
  return (
    <>
      <Heading variant="h1">Random Avatars</Heading>
      <WarningMessage>
        Moved to <Link to={routes.viewAvatars}>avatars page</Link> and sort by
        "random"
      </WarningMessage>
    </>
  )
}
