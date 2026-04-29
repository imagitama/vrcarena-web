import React, { useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'

import { CollectionNames, FullTag } from '@/modules/tags'
import * as routes from '@/routes'
import { getLabelForTag } from '@/utils/tags'
import { AccessStatus } from '@/modules/common'
import { PublicAsset } from '@/modules/assets'
import { ViewNames } from '@/modules/tags'

import useIsEditor from '@/hooks/useIsEditor'
import useDataStoreItem from '@/hooks/useDataStoreItem'

import Heading from '@/components/heading'
import AssetsPaginatedView from '@/components/assets-paginated-view'
import ErrorMessage from '@/components/error-message'
import EditorRecordManager from '@/components/editor-record-manager'
import BodyText from '@/components/body-text'
import Button from '@/components/button'
import PublicEditorNotes from '@/components/public-editor-notes'
import Message from '@/components/message'
import { GetQueryFn } from '@/components/paginated-view'

const AssetsForTag = ({ tag }: { tag: string }) => {
  const getQuery = useCallback<GetQueryFn<PublicAsset>>(
    (query) => query.contains('tags', `{${tag}}`),
    [tag]
  )
  return (
    <AssetsPaginatedView
      getQuery={getQuery}
      extraControlsLeft={[
        <Button
          url={routes.queryWithVar.replace(':query', tag)}
          color="secondary">
          Run As Query
        </Button>,
      ]}
      urlWithPageNumberVar={routes.viewTagWithPageNumberVar.replace(
        ':tag',
        tag
      )}
    />
  )
}

export default () => {
  const { tag } = useParams<{ tag: string }>()
  const isEditor = useIsEditor()
  const [, , fullTag, hydrate] = useDataStoreItem<FullTag>(
    ViewNames.GetFullTags,
    tag,
    { queryName: 'view-tag' }
  )

  if (!tag) {
    return <ErrorMessage>You must provide a tag</ErrorMessage>
  }

  return (
    <>
      <Helmet>
        <title>View tag {tag} | VRCArena</title>
        <meta
          name="description"
          content={`View more info about the tag ${tag} including stats.`}
        />
      </Helmet>
      {fullTag && fullTag.accessstatus === AccessStatus.Deleted ? (
        <Message>This tag has been deleted</Message>
      ) : null}
      {fullTag && fullTag.editornotes ? (
        <PublicEditorNotes notes={fullTag.editornotes} />
      ) : null}
      <Heading variant="h1">
        {tag}
        {fullTag ? ` (${fullTag.count})` : ''}
      </Heading>{' '}
      {fullTag ? (
        <Heading variant="h2">
          {fullTag.label || getLabelForTag(fullTag.id)}
        </Heading>
      ) : null}
      {fullTag ? <BodyText>{fullTag.description}</BodyText> : null}
      {isEditor && fullTag ? (
        <EditorRecordManager
          id={tag}
          metaCollectionName={CollectionNames.TagsMeta}
          editUrl={routes.editTagWithVar.replace(':tag', tag)}
          showApprovalButtons={false}
          showAccessButtons
          onDone={hydrate}
        />
      ) : null}
      <AssetsForTag tag={tag} />
    </>
  )
}
