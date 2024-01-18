import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Link from '../../components/link'
import useDatabaseQuery, {
  CollectionNames,
  Operators,
  options,
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import ImageGallery from '../image-gallery'
import {
  AttachmentsFieldNames,
  FullAttachment,
} from '../../modules/attachments'

const LoadingGallery = () => {
  return <ImageGallery showLoadingCount={3} />
}

const getParentLink = (parentTable: string, parentId: string) => {
  switch (parentTable) {
    case CollectionNames.Assets:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    default:
      return '#error'
  }
}

const getParentLabel = (parentTable: string, parentId: string) => {
  switch (parentTable) {
    case CollectionNames.Assets:
      return 'asset'
    default:
      return 'error'
  }
}

export default ({
  parentTable,
  parentId,
  createdBy = undefined,
  includeParents = false,
}: {
  parentTable: string
  parentId: string
  createdBy?: string
  includeParents?: boolean
}) => {
  const [isLoading, isError, attachments] = useDatabaseQuery<FullAttachment>(
    'getPublicAttachments',
    createdBy
      ? [[AttachmentsFieldNames.createdBy, Operators.EQUALS, createdBy]]
      : [
          [AttachmentsFieldNames.parentTable, Operators.EQUALS, parentTable],
          [AttachmentsFieldNames.parentId, Operators.EQUALS, parentId],
        ],
    {
      [options.queryName]: 'attachments',
      [options.subscribe]: true,
    }
  )

  if (isLoading) {
    return <LoadingGallery />
  }

  if (isError || !Array.isArray(attachments)) {
    return <ErrorMessage>Failed to load attachments</ErrorMessage>
  }

  if (!attachments.length) {
    return <NoResultsMessage>No user attachments found</NoResultsMessage>
  }

  return (
    <div>
      <ImageGallery
        images={attachments.map((attachment) => ({
          url: attachment.url,
          caption: (
            <>
              Posted by{' '}
              <Link
                to={routes.viewUserWithVar.replace(
                  ':userId',
                  attachment.createdby
                )}>
                {attachment.createdbyusername}
              </Link>
              {includeParents ? (
                <>
                  {' '}
                  for{' '}
                  <Link
                    to={getParentLink(
                      attachment.parenttable,
                      attachment.parentid
                    )}>
                    {getParentLabel(
                      attachment.parenttable,
                      attachment.parentid
                    )}
                  </Link>
                </>
              ) : null}
            </>
          ),
        }))}
      />
    </div>
  )
}
