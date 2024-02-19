import React from 'react'
import { Helmet } from 'react-helmet'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

import * as routes from '../../routes'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'

import UserList from '../../components/user-list'
import Heading from '../../components/heading'
import PaginatedView from '../../components/paginated-view'
import Button from '../../components/button'
import { trackAction } from '../../analytics'
import { PATREON_BECOME_PATRON_URL } from '../../config'
import patreonLogoUrl from '../../assets/images/patreon-logo.png'

const sortKey = 'patreon'

const useStyles = makeStyles({
  logo: {
    '& a': {
      display: 'block',
      textAlign: 'center',
    },
  },
})

const Renderer = ({ items }) => <UserList users={items} />

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
            dataPatreonWidgetType="become-patron-button"
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
        {/* broken as of 19 feb 2024! probably permissions issue as patreon info is stored in secure table */}
        {/* <Heading variant="h2">Patrons on VRCArena</Heading>
        <PaginatedView
          viewName={`getPatreonUsers`}
          sortKey={sortKey}
          defaultFieldName={UserFieldNames.createdAt}>
          <Renderer />
        </PaginatedView>
        <p>List of Patreon users is updated daily</p> */}
      </Container>
    </>
  )
}
