import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import { logout } from '../../firebase'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'
import useQueryParams from '../../hooks/useQueryParams'
import SuccessMessage from '../../components/success-message'
import { handleError } from '@/error-handling'
import { formHideDelay } from '@/config'

export default () => {
  const [isLoading, isErrored, user] = useUserRecord()
  const { push } = useHistory()
  const queryParams = useQueryParams()

  useEffect(() => {
    ;(async () => {
      try {
        console.debug('logging out user...')

        await logout()

        trackAction('Logout', 'Auto-logout user')

        const fromPath = queryParams.get('from')

        console.debug(`user was logged out successfully, redirecting...`, {
          from: fromPath,
        })

        setTimeout(() => {
          push(fromPath || routes.home)
        }, formHideDelay)
      } catch (err) {
        console.error(err)
        handleError(err)
      }
    })()
  }, [])

  return (
    <>
      <Helmet>
        <title>Logout of your account | VRCArena</title>
        <meta name="description" content="Logout of your account." />
      </Helmet>
      <SuccessMessage>You are now logged out. Redirecting...</SuccessMessage>
    </>
  )
}
