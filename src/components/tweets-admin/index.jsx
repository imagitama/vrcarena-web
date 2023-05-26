import React, { useCallback, useState } from 'react'
import useDatabaseQuery, {
  AssetMetaFieldNames,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import useDataStoreItem from '../../hooks/useDataStoreItem'
import useDataStore from '../../hooks/useDataStore'
import { client as supabase } from '../../supabase'
import { TweetQueueFieldNames, TweetsFieldNames } from '../../data-store'
import { callFunction } from '../../firebase'
import { handleError } from '../../error-handling'

import Tweet from '../tweet'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import Button from '../button'

export default ({ assetId }) => {
  const [
    isLoadingAssetMeta,
    isErrorLoadingAssetMeta,
    assetMeta,
    hydrateAssetMeta
  ] = useDataStoreItem(
    CollectionNames.AssetMeta,
    assetId,
    'asset-meta-for-tweets'
  )
  const getQueuedQuery = useCallback(() => {
    if (!assetMeta) {
      return supabase
    }
    return supabase
      .from(CollectionNames.TweetsQueue)
      .select('*')
      .in('id', assetMeta[AssetMetaFieldNames.queuedTweetRecordIds] || [])
  }, [
    assetMeta && assetMeta[AssetMetaFieldNames.queuedTweetRecordIds] !== null
      ? assetMeta[AssetMetaFieldNames.queuedTweetRecordIds].join('+')
      : ''
  ])
  const [
    isLoadingQueuedTweets,
    isErrorLoadingQueuedTweets,
    queuedTweets
  ] = useDataStore(getQueuedQuery, 'queued-tweets')
  const getAllQuery = useCallback(() => {
    if (!assetMeta) {
      return supabase
    }
    return supabase
      .from(CollectionNames.Tweets)
      .select('*')
      .in('id', assetMeta[AssetMetaFieldNames.tweetRecordIds] || [])
  }, [
    assetMeta && assetMeta[AssetMetaFieldNames.tweetRecordIds] !== null
      ? assetMeta[AssetMetaFieldNames.tweetRecordIds].join('+')
      : ''
  ])
  const [
    isLoadingAllTweets,
    isErrorLoadingAllTweets,
    allTweets,
    ,
    hydrateAllTweets
  ] = useDataStore(getAllQuery, 'all-tweets')
  const [tweetRecordIdBeingDeleted, setTweetRecordIdBeingDeleted] = useState(
    null
  )
  const [
    resendingAssetApprovedTweet,
    setResendingAssetApprovedTweet
  ] = useState(false)

  if (resendingAssetApprovedTweet) {
    return <LoadingIndicator message="Re-sending asset approved tweet..." />
  }

  if (isLoadingAssetMeta || !assetMeta) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (isErrorLoadingAssetMeta) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  const {
    [AssetMetaFieldNames.tweetRecordIds]: tweetRecordIds = [],
    [AssetMetaFieldNames.queuedTweetRecordIds]: queuedTweetRecordIds = []
  } = assetMeta

  if (isLoadingQueuedTweets) {
    return <LoadingIndicator message="Loading queued tweets..." />
  }

  if (isErrorLoadingQueuedTweets) {
    return <ErrorMessage>Failed to load queued tweets</ErrorMessage>
  }

  if (isLoadingAllTweets) {
    return <LoadingIndicator message="Loading tweets..." />
  }

  if (isErrorLoadingAllTweets) {
    return <ErrorMessage>Failed to tweets</ErrorMessage>
  }

  const deleteTweet = async (tweetRecordId, tweetId) => {
    try {
      setTweetRecordIdBeingDeleted(tweetId)

      console.debug(`Deleting tweet`, tweetRecordId, tweetId)

      const result = await callFunction('deleteTweet', {
        tweetRecordId,
        tweetId
      })

      console.debug('Result of delete tweet:', result)

      setTweetRecordIdBeingDeleted(null)

      hydrateAllTweets()
    } catch (err) {
      setTweetRecordIdBeingDeleted(null)
      console.error(err)
      handleError(err)
    }
  }

  const resendApprovalTweet = async () => {
    try {
      setResendingAssetApprovedTweet(true)

      console.debug(`Resending approval tweet`)

      const result = await callFunction('resendAssetApprovedTweet', {
        assetId
      })

      console.debug('Result of resend approval tweet:', result)

      setResendingAssetApprovedTweet(false)

      hydrateAssetMeta()
    } catch (err) {
      setResendingAssetApprovedTweet(false)
      console.error(err)
      handleError(err)
    }
  }

  const totalNumberOfTweets =
    (tweetRecordIds ? tweetRecordIds.length : 0) +
    (queuedTweetRecordIds ? queuedTweetRecordIds.length : 0)

  const sentTweetRecords = allTweets
    ? allTweets.filter(record => record[TweetsFieldNames.tweetId])
    : []
  const pendingTweetRecords = allTweets
    ? allTweets.filter(record => !record[TweetsFieldNames.tweetId])
    : []

  return (
    <div>
      Found {totalNumberOfTweets} tweets attached to this asset
      <Heading variant="h3">Delivered</Heading>
      {sentTweetRecords.length
        ? sentTweetRecords.map(tweetRecord => (
            <div key={tweetRecord.id}>
              <Tweet tweetId={tweetRecord[TweetsFieldNames.tweetId]} />
              <br />
              {tweetRecordIdBeingDeleted === tweetRecord.id ? (
                'Deleting...'
              ) : (
                <Button
                  onClick={() =>
                    deleteTweet(
                      tweetRecord.id,
                      tweetRecord[TweetsFieldNames.tweetId]
                    )
                  }>
                  Delete
                </Button>
              )}
            </div>
          ))
        : 'None'}
      <Heading variant="h3">Pending / Deleted</Heading>
      {pendingTweetRecords.length
        ? pendingTweetRecords.map(tweetRecord => (
            <div key={tweetRecord.id}>
              {tweetRecord[TweetsFieldNames.status]}
            </div>
          ))
        : 'None'}
      <Heading variant="h3">Queued</Heading>
      {queuedTweets && queuedTweets.length
        ? queuedTweets.map(tweetRecord => (
            <div key={tweetRecord.id}>
              {tweetRecord[TweetQueueFieldNames.status]}
            </div>
          ))
        : 'None'}
      <br />
      <br />
      <Button onClick={() => resendApprovalTweet()}>
        Re-send asset approved tweet
      </Button>
    </div>
  )
}
