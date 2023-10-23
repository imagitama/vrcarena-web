import React, { Fragment, useCallback } from 'react'
import TagChip from '../tag-chip'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'
import { FullTag } from '../../modules/tags'

export default () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useCallback(() => {
    let query = supabase
      .from('getFullTags'.toLowerCase())
      .select('*')
      .order('count', { ascending: false })

    query = isAdultContentEnabled === false ? query.is('isadult', false) : query

    return query
  }, [isAdultContentEnabled])

  const [isLoading, isError, allTagDetails] = useDataStore<FullTag[]>(
    getQuery,
    'all-tags-browser'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading tags..." />
  }

  if (isError || !Array.isArray(allTagDetails) || !allTagDetails.length) {
    return <ErrorMessage>Failed to load tags</ErrorMessage>
  }

  return (
    <>
      {allTagDetails.map(tagDetails => (
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
