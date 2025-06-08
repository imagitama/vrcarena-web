import React, { Fragment, useCallback } from 'react'
import TagChip from '../tag-chip'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import useDataStore from '../../hooks/useDataStore'
import { FullTag, ViewNames } from '../../modules/tags'
import { SupabaseClient } from '@supabase/supabase-js'

export default () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useCallback(
    (supabase: SupabaseClient) => {
      let query = supabase
        .from(ViewNames.GetFullTags)
        .select('*')
        .order('count', { ascending: false })

      query =
        isAdultContentEnabled === false ? query.is('isadult', false) : query

      return query
    },
    [isAdultContentEnabled]
  )

  const [isLoading, lastErrorCode, allTagDetails] = useDataStore<FullTag>(
    getQuery,
    'all-tags-browser'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading tags..." />
  }

  if (
    lastErrorCode !== null ||
    !Array.isArray(allTagDetails) ||
    !allTagDetails.length
  ) {
    return <ErrorMessage>Failed to load tags</ErrorMessage>
  }

  return (
    <>
      {allTagDetails.map((tagDetails) => (
        <Fragment key={tagDetails.tag}>
          <TagChip
            tagName={tagDetails.id}
            label={`${tagDetails.id}${
              tagDetails.count ? ` (${tagDetails.count})` : ''
            }`}
          />
          <br />
        </Fragment>
      ))}
    </>
  )
}
