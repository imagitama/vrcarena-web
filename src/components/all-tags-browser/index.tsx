import React, { Fragment, useCallback } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

import useIsAdultContentEnabled from '@/hooks/useIsAdultContentEnabled'
import useDataStore from '@/hooks/useDataStore'
import TagChip from '@/components/tag-chip'
import LoadingIndicator from '@/components/loading-indicator'
import ErrorMessage from '@/components/error-message'
import { FullTag, ViewNames } from '@/modules/tags'
import NoResultsMessage from '../no-results-message'

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

  if (lastErrorCode !== null) {
    return (
      <ErrorMessage>Failed to load tags (code {lastErrorCode})</ErrorMessage>
    )
  }

  if (isLoading || !Array.isArray(allTagDetails)) {
    return <LoadingIndicator message="Loading tags..." />
  }

  if (!allTagDetails.length) {
    return <NoResultsMessage>No tags found</NoResultsMessage>
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
