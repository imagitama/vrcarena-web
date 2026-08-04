import React from 'react'
import { Helmet } from '@unhead/react/helmet'

export default () => {
  return (
    <>
      <Helmet>
        <title>Development area</title>
        <meta name="description" content="Internal use." />
      </Helmet>
      <div>
        <h1>Components</h1>
      </div>
    </>
  )
}
