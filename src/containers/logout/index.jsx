import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import { logout } from '../../firebase'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'
import useQueryParams from '../../hooks/useQueryParams'

export default () => {
  const [isLoading, isErrored, user] = useUserRecord()
  const { push } = useHistory()
  const queryParams = useQueryParams()

  useEffect(() => {
    if (isLoading || isErrored) {
      return
    }

    if (!user) {
      trackAction('Logout', 'User tried to logout but was already logged out')
      return
    }

    logout()

    trackAction('Logout', 'Auto-logout user')

    setTimeout(() => {
      const fromPath = queryParams.get('from')
      push(fromPath || routes.home)
    }, 1500)
  }, [isLoading, isErrored, user === null])

  return (
    <>
      <Helmet>
        <title>Logout of your account | VRCArena</title>
        <meta name="description" content="Logout of your account." />
      </Helmet>
      You are now logged out. Redirecting...
    </>
  )
}
