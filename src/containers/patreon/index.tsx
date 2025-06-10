import React from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@mui/styles'
import Container from '@mui/material/Container'

import * as routes from '../../routes'

import Heading from '../../components/heading'
import Button from '../../components/button'
import { trackAction } from '../../analytics'
import { PATREON_BECOME_PATRON_URL } from '../../config'
import patreonLogoUrl from '../../assets/images/patreon-logo.png'

const useStyles = makeStyles({
  logo: {
    '& a': {
      display: 'block',
      textAlign: 'center',
    },
  },
})

export default () => {
  const classes = useStyles()

  return (
    <>
      <Helmet>
        <title>View the Patreon supporters of the site | VRCArena</title>
        <meta
          name="description"
          content={`Become a patron of our Patreon to support the costs in maintaining the site and building new features.`}
        />
      </Helmet>
      <Container maxWidth="md">
        <p className={classes.logo}>
          <a
            href={PATREON_BECOME_PATRON_URL}
            onClick={() => trackAction('Patreon', 'Click Patreon logo')}>
            <img src={patreonLogoUrl} alt="Patreon logo" width="50%" />
          </a>
          <Button
            url={PATREON_BECOME_PATRON_URL}
            onClick={() =>
              trackAction('Patreon', 'Click become patron button')
            }>
            Become a patron and support VRCArena!
          </Button>
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
      </Container>
    </>
  )
}
