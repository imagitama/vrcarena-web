import React, { Fragment } from 'react'

import Link from '@/components/link'
import * as routes from '@/routes'

export default ({
  speciesIds,
  speciesNames,
}: {
  speciesIds: string[]
  speciesNames: string[]
}) => {
  if (!speciesIds.length) {
    return null
  }

  return (
    <>
      {speciesIds.map((speciesId, idx) => (
        <Fragment key={speciesId}>
          {idx > 0 ? ', ' : ''}
          <Link
            to={routes.viewSpeciesWithVar.replace(
              ':speciesIdOrSlug',
              speciesId
            )}>
            {speciesNames[idx] || '(no species name)'}
          </Link>
        </Fragment>
      ))}
    </>
  )
}
