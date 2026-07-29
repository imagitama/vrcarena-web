import React from 'react'
import { Helmet } from '@unhead/react/helmet'
import styled from '@emotion/styled'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'

import { getUrlForParent } from '@/relations'
import { ResolutionStatus } from '@/modules/support-tickets'
import useIsEditor from '@/hooks/useIsEditor'

import Link from '@/components/link'
import GenericOutputItem from '@/components/generic-output-item'
import Heading from '@/components/heading'
import CommentList from '@/components/comment-list'
import NoResultsMessage from '@/components/no-results-message'
import FormattedDate from '@/components/formatted-date'
import ResolutionStatusOutput from '@/components/resolution-status'
import Button from '@/components/button'
import ResolutionControls from '@/components/resolution-controls'
import Markdown from '@/components/markdown'
import EditorBox from '@/components/editor-box'
import AssignForm from '@/components/assign-form'
import UsernameLink from '@/components/username-link'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow,
} from '@/media-queries'
import { HydrateFn } from '@/hooks/useDataStore'
import { getShortId } from '@/utils/formatting'
import AdminGenericHistory from '../admin-generic-history'
import ErrorBoundary from '../error-boundary'

const Cells = styled.div`
  display: flex;
`

const Cell = styled.div`
  width: 33.3%;
  ${mediaQueryForTabletsOrBelow} {
    width: 50%;
  }
  ${mediaQueryForMobiles} {
    width: 100%;
  }
`

export interface ResolvableItem extends Record<string, any> {
  id: string
  category?: string
  relatedtable: string | null // table name
  relatedid: string | null
  comments: string | null
  lastmodifiedat: string | null // Date
  lastmodifiedby: string | null
  createdat: string // Date
  createdby: string
}

export interface ResolvableItemMeta extends Record<string, unknown> {
  editornotes: string | null
  resolutionstatus: ResolutionStatus
  resolvedat: string | null // Date
  resolvedby: string | null
  assignedto: string | null // id
  resolutionnotes: string | null
}

export interface FullResolvableItem<TRelated = any>
  extends ResolvableItem,
    ResolvableItemMeta {
  relateddata: TRelated
  createdbyusername: string
  createdbyavatarurl: string
  lastmodifiedbyusername: string | null
  lastmodifiedbyavatarurl: string | null
  resolvedbyusername: string | null
  resolvedbyavatarurl: string | null
  assignedtousername: string | null
  assignedtoavatarurl: string | null
}

const ResolvableItem = ({
  collectionName,
  metaCollectionName,
  title,
  item,
  url,
  hydrate,
}: {
  collectionName: string
  metaCollectionName: string
  title: string
  item: FullResolvableItem
  url: string
  hydrate: HydrateFn
}) => {
  const isEditor = useIsEditor()

  return (
    <>
      <Helmet>
        <title>
          {title} #{getShortId(item.id)}
        </title>
        <meta
          name="description"
          content={`Read more information about ${title.toLowerCase()} #${
            item.id
          } on the site.`}
        />
      </Helmet>
      <Heading variant="h1" noMargin>
        <Link to={url} title={item.id}>
          {title} #{getShortId(item.id)}
        </Link>
      </Heading>
      <Cells>
        {item.category && (
          <Cell>
            <Heading variant="h2">Category/Reason</Heading>
            {item.category}
          </Cell>
        )}
        <Cell>
          <Heading variant="h2">Metadata</Heading>
          Created <FormattedDate date={item.createdat} /> by{' '}
          <UsernameLink
            id={item.createdby}
            username={item.createdbyusername}
            avatarUrl={item.createdbyavatarurl}
          />
          {item.lastmodifiedby && item.lastmodifiedat && (
            <>
              <br />
              Modified <FormattedDate date={item.lastmodifiedat} /> by{' '}
              <UsernameLink
                id={item.lastmodifiedby}
                username={item.lastmodifiedbyusername || '(no username)'}
                avatarUrl={item.lastmodifiedbyavatarurl}
              />
            </>
          )}
        </Cell>
        <Cell>
          <Heading variant="h2">Resolution</Heading>
          {item.assignedto && (
            <>
              <AssignmentIndIcon />
              Assigned to{' '}
              <UsernameLink
                id={item.assignedto}
                username={item.assignedtousername || '(no username)'}
                avatarUrl={item.assignedtoavatarurl}
              />
            </>
          )}
          <ResolutionStatusOutput
            resolutionStatus={item.resolutionstatus}
            resolvedAt={item.resolvedat}
            resolvedBy={item.resolvedby}
            resolvedByUsername={item.resolvedbyusername}
            resolvedByAvatarUrl={item.resolvedbyavatarurl}
          />
          {item.resolutionnotes && <Markdown source={item.resolutionnotes} />}
        </Cell>
      </Cells>
      {isEditor ? (
        <>
          <br />
          <EditorBox>
            <Heading variant="h3" noTopMargin>
              Assignment
            </Heading>
            <AssignForm
              id={item.id}
              metaCollectionName={metaCollectionName}
              existingAssignedTo={item.assignedto}
              existingAssignedToUsername={item.assignedtousername}
              onlyStaff
              onDone={hydrate}
            />
            <Heading variant="h3" noMargin>
              Resolution
            </Heading>
            <ResolutionControls
              id={item.id}
              metaCollectionName={metaCollectionName}
              existingResolutionStatus={item.resolutionstatus}
              existingResolutionNotes={item.resolutionnotes}
              onDone={hydrate}
            />
          </EditorBox>
        </>
      ) : null}
      {item.relatedtable && item.relatedid ? (
        <>
          <Heading variant="h2">Related Item</Heading>
          <Button
            url={getUrlForParent(
              item.relatedtable,
              item.relatedid,
              item.relateddata
            )}
            color="secondary">
            View Related Item
          </Button>
          <br />
          <br />
          <GenericOutputItem
            type={item.relatedtable}
            id={item.relatedid}
            data={item.relateddata}
          />
        </>
      ) : null}
      <Heading variant="h2">Submitter Notes</Heading>
      {item.comments ? (
        <Markdown source={item.comments} />
      ) : (
        <NoResultsMessage>No comments</NoResultsMessage>
      )}
      <Heading variant="h2">Comments</Heading>
      <CommentList collectionName={collectionName} parentId={item.id} />
      {isEditor && (
        <ErrorBoundary>
          <AdminGenericHistory
            id={item.id}
            type={collectionName}
            metaType={metaCollectionName}
          />
        </ErrorBoundary>
      )}
    </>
  )
}

export default ResolvableItem
