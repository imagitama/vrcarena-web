import React from 'react'
import { Helmet } from 'react-helmet'
import AllTagsBrowser from '../../components/all-tags-browser'
import Heading from '../../components/heading'

export default () => {
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
      <AllTagsBrowser />
    </>
  )
}
