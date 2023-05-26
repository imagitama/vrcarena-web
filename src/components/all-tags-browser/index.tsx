import React, { useCallback } from 'react'
import TagChip from '../tag-chip'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'

export default () => {
  const isAdultContentEnabled = useIsAdultContentEnabled()

  const getQuery = useCallback(
    () =>
      supabase
        .from(
          (isAdultContentEnabled ? 'getAllTags' : 'getAllSfwTags').toLowerCase()
        )
        .select('*'),
    [isAdultContentEnabled]
  )

  const [isLoading, isError, results] = useDataStore<{ tags: string[] }>(
    getQuery,
    'all-tags-browser'
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading tags..." />
  }

  if (isError || !Array.isArray(results) || !results.length) {
    return <ErrorMessage>Failed to load tags</ErrorMessage>
  }

  const tags: string[] = results[0].tags

  return (
    <>
      {tags.map(tag => (
        <TagChip key={tag} tagName={tag} />
      ))}
    </>
  )
}
