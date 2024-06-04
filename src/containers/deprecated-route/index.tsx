import React from 'react'
import { Helmet } from 'react-helmet'
import ErrorMessage from '../../components/error-message'

const DeprecatedRouteView = () => (
  <>
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <ErrorMessage>
      This page has been removed as it was old, unused or unpopular. If you
      think this is a mistake please message our team in our Discord server.
    </ErrorMessage>
  </>
)

export default DeprecatedRouteView
