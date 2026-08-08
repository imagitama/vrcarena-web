import React from 'react'

import * as routes from '@/routes'
import { BacklogItem } from '@/modules/backlog'
import { Asset, FunctionNames as AssetsFunctionNames } from '@/modules/assets'
import {
  Author,
  FunctionNames as AuthorsFunctionNames,
} from '@/modules/authors'
import { getShortId, stripQueryAndHash } from '@/utils/formatting'
import useDataStoreFunction from '@/hooks/useDataStoreFunction'

import Button from '@/components/button'
import ErrorMessage from '@/components/error-message'
import LoadingIndicator from '@/components/loading-indicator'
import WarningMessage from '@/components/warning-message'
import Message from '@/components/message'
import Link from '@/components/link'

/**
 * TODO: reduce code dupe here
 */

interface GetAssetsWithSourceUrlPayload {
  p_url: string
}
type GetAssetsWithSourceUrlResult = Asset[] // TODO: switch to actual slimmer type

export const CheckAssetExistsButton = ({
  backlogItem,
}: {
  backlogItem: BacklogItem
}) => {
  const [isCalling, lastErrorCode, lastResult, call] = useDataStoreFunction<
    GetAssetsWithSourceUrlPayload,
    GetAssetsWithSourceUrlResult
  >(AssetsFunctionNames.GetAssetsWithSourceUrl, [])

  const onClickCheck = async () => {
    const results = await call({
      p_url: backlogItem.url,
    })

    if (!results || !Array.isArray(results)) throw new Error('Invalid result')

    if (!results.length && backlogItem.url.includes('?')) {
      const lighterUrl = stripQueryAndHash(backlogItem.url)
      await call({
        p_url: lighterUrl,
      })
    }
  }

  return (
    <>
      {isCalling ? (
        <LoadingIndicator message="Searching..." />
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed (code {lastErrorCode})</ErrorMessage>
      ) : lastResult !== null ? (
        lastResult.length ? (
          <WarningMessage>
            Found {lastResult.length} assets with this URL:
            <ul>
              {lastResult.map((record) => (
                <li key={record.id}>
                  <Link
                    to={routes.viewAssetWithVar.replace(
                      ':assetId',
                      record.slug || record.id
                    )}>
                    #{getShortId(record.id)} - {record.title}
                  </Link>
                </li>
              ))}
            </ul>
          </WarningMessage>
        ) : (
          <Message>
            No assets have this URL as their source URL (or extra sources).
            Please create 🙏
          </Message>
        )
      ) : null}
      <Button
        isDisabled={isCalling}
        onClick={onClickCheck}
        title="Searches for any published assets that have the URL"
        size="small"
        color="secondary">
        Check If Exists
      </Button>
    </>
  )
}

interface GetAuthorsWithUrlPayload {
  p_url: string
}
type GetAuthorsWithUrlResult = Author[] // TODO: switch to actual slimmer type

export const CheckAuthorExistsButton = ({
  backlogItem,
}: {
  backlogItem: BacklogItem
}) => {
  const [isCalling, lastErrorCode, lastResult, call] = useDataStoreFunction<
    GetAuthorsWithUrlPayload,
    GetAuthorsWithUrlResult
  >(AuthorsFunctionNames.GetAuthorsWithUrl, [])

  const onClickCheck = async () => {
    const results = await call({
      p_url: backlogItem.url,
    })

    if (!results || !Array.isArray(results)) throw new Error('Invalid result')

    if (!results.length && backlogItem.url.includes('?')) {
      const lighterUrl = stripQueryAndHash(backlogItem.url)
      await call({
        p_url: lighterUrl,
      })
    }
  }

  return (
    <>
      {isCalling ? (
        <LoadingIndicator message="Searching..." />
      ) : lastErrorCode !== null ? (
        <ErrorMessage>Failed (code {lastErrorCode})</ErrorMessage>
      ) : lastResult !== null ? (
        lastResult.length ? (
          <WarningMessage>
            Found {lastResult.length} authors with this URL:
            <ul>
              {lastResult.map((record) => (
                <li key={record.id}>
                  <Link
                    to={routes.viewAuthorWithVar.replace(
                      ':authorId',
                      record.id
                    )}>
                    #{getShortId(record.id)} - {record.name}
                  </Link>
                </li>
              ))}
            </ul>
          </WarningMessage>
        ) : (
          <Message>
            No authors have this URL as their website URL (they might have a
            Gumroad/Jinxxy/etc. set though). Please create 🙏
          </Message>
        )
      ) : null}
      <Button
        isDisabled={isCalling}
        onClick={onClickCheck}
        title="Searches for any published authors that has the URL"
        size="small"
        color="secondary">
        Check If Exists
      </Button>
    </>
  )
}
