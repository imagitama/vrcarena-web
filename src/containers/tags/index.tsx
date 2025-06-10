import React from 'react'
import { Helmet } from 'react-helmet'
import AddIcon from '@mui/icons-material/Add'

import AllTagsBrowser from '../../components/all-tags-browser'
import Button from '../../components/button'
import Heading from '../../components/heading'
import useIsEditor from '../../hooks/useIsEditor'
import * as routes from '../../routes'

export default () => {
  const isEditor = useIsEditor()
  return (
    <>
      <Helmet>
        <title>Browse tags | VRCArena</title>
        <meta
          name="description"
          content={`See a list of all of the popular tags used on the site.`}
        />
      </Helmet>
      <Heading variant="h1">Browse tags</Heading>
      {isEditor ? (
        <Button url={routes.createTag} icon={<AddIcon />}>
          Create
        </Button>
      ) : null}
      <AllTagsBrowser />
    </>
  )
}
