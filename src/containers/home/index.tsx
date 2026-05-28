import React from 'react'
import { Helmet } from '@unhead/react/helmet'

import useSearchTerm from '@/hooks/useSearchTerm'
import SpeciesBrowser from '@/components/species-browser'
import { DEFAULT_PAGE_DESC } from '@/config'

export default () => {
  const searchTerm = useSearchTerm()

  if (searchTerm) {
    return null
  }

  return (
    <>
      <Helmet>
        <title>
          An open-source, not-for-profit community project to document, tag and
          categorize every asset for VR social games such as VRChat, ChilloutVR
          and Resonite.
        </title>
        <meta name="description" content={DEFAULT_PAGE_DESC} />
      </Helmet>
      <SpeciesBrowser />
    </>
  )
}
