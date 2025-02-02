import React, { useCallback, useState } from 'react'
import ShuffleIcon from '@material-ui/icons/Shuffle'

import * as routes from '../../routes'
import { Asset } from '../../modules/assets'

import useDataStore from '../../hooks/useDataStore'
import { AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'

import Heading from '../../components/heading'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import AssetResults from '../../components/asset-results'
import Button from '../../components/button'
import { SupabaseClient } from '@supabase/supabase-js'

const View = ({ count }: { count: number }) => {
  const isAdultContentEnabled = useIsAdultContentEnabled()
  const getQuery = useCallback(
    (supabase: SupabaseClient) => {
      let query = supabase.from('getrandompublicavatars').select('*').limit(5)

      if (!isAdultContentEnabled) {
        query = query.eq(AssetFieldNames.isAdult, false)
      }

      return query
    },
    [isAdultContentEnabled, count]
  )
  const [isLoading, lastErrorCode, avatars] = useDataStore<Asset>(getQuery)

  if (isLoading || !avatars) {
    return <LoadingIndicator message="Finding random avatars..." />
  }

  if (lastErrorCode !== null) {
    return <ErrorMessage>Failed to find avatars</ErrorMessage>
  }

  return <AssetResults assets={avatars} />
}

export default () => {
  const [count, setCount] = useState<number>(0)
  const regenerate = () =>
    setCount((currentVal) => {
      return currentVal + 1
    })
  return (
    <>
      <Heading variant="h1">Random Avatars</Heading>
      <Button onClick={regenerate} icon={<ShuffleIcon />}>
        Regenerate
      </Button>{' '}
      <Button url={routes.viewAvatars} color="default">
        View All
      </Button>
      <View count={count} />
    </>
  )
}
