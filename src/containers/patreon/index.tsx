import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import { makeStyles } from '@mui/styles'
import Container from '@mui/material/Container'

import * as routes from '@/routes'
import { trackAction } from '@/analytics'
import { PATREON_BECOME_PATRON_URL } from '@/config'
import patreonLogoUrl from '@/assets/images/patreon-logo.png'
import { Patreon as PatreonIcon } from '@/icons'

import Link from '@/components/link'
import Heading from '@/components/heading'
import Button from '@/components/button'
import useDataStoreItems from '@/hooks/useDataStoreItems'
import { PatreonStatus, PatronUserForList, UserForList } from '@/modules/users'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import UserList from '@/components/user-list'

const useStyles = makeStyles({
  link: {
    display: 'block',
    textAlign: 'center',
  },
  button: {
    display: 'flex',
    justifyContent: 'center',
  },
})

enum ViewNames {
  GetPatreonUsers = 'getpatreonusers',
}

const Patrons = () => {
  const [isLoading, lastErrorCode, patrons] =
    useDataStoreItems<PatronUserForList>(ViewNames.GetPatreonUsers, undefined, {
      queryName: 'get-patrons',
    })

  if (lastErrorCode !== null)
    return (
      <ErrorMessage>Failed to get patrons (code {lastErrorCode})</ErrorMessage>
    )

  if (isLoading || !patrons)
    return <LoadingIndicator message="Getting patrons..." />

  const { active, previous } = patrons.reduce<{
    active: PatronUserForList[]
    previous: PatronUserForList[]
  }>(
    (results, patron) => {
      if (patron.patreonstatus === PatreonStatus.Patron) {
        return {
          ...results,
          active: results.active.concat([patron]),
        }
      }
      return {
        ...results,
        previous: results.previous.concat([patron]),
      }
    },
    {
      active: [],
      previous: [],
    }
  )

  return (
    <>
      <Heading variant="h2">Active Patrons</Heading>
      <UserList users={active} />
      <Heading variant="h2">Previous Patrons</Heading>
      <UserList users={previous} />
    </>
  )
}

export default () => {
  const classes = useStyles()

  return (
    <>
      <Helmet>
        <title>View the Patreon supporters of the site</title>
        <meta
          name="description"
          content={`Become a patron of our Patreon to support the costs in maintaining the site and building new features.`}
        />
      </Helmet>
      <Container maxWidth="md">
        <p>
          <a
            href={PATREON_BECOME_PATRON_URL}
            onClick={() => trackAction('Patreon', 'Click Patreon logo')}
            className={classes.link}>
            <img src={patreonLogoUrl} alt="Patreon logo" width="50%" />
          </a>
          <div className={classes.button}>
            <Button
              url={PATREON_BECOME_PATRON_URL}
              size="large"
              icon={<PatreonIcon />}
              onClick={() =>
                trackAction('Patreon', 'Click become patron button')
              }>
              Become a patron and support VRCArena!
            </Button>
          </div>
        </p>

        <Heading variant="h2">Connect your VRCArena account</Heading>
        <p>
          Go to{' '}
          <Link
            to={routes.myAccount}
            onClick={() =>
              trackAction('Patreon', 'Click go to My Account link')
            }>
            My Account
          </Link>{' '}
          and click the Patreon tab for instructions.
        </p>

        <Patrons />
      </Container>
    </>
  )
}
