import React from 'react'
import AttachmentMeta from '../attachment-meta'
import Link from '../../components/link'
import useIsEditor from '../../hooks/useIsEditor'
import {
  Attachment,
  FullAttachment,
  isFullAttachment,
} from '../../modules/attachments'

import * as routes from '../../routes'
import { CollectionNames } from '../../modules/assets'
import Paper from '../paper'

const getParentLink = (parentTable: string, parentId: string): string => {
  switch (parentTable) {
    case CollectionNames.Assets:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    default:
      return '#error'
  }
}

const getParentLabel = (parentTable: string, parentId: string): string => {
  switch (parentTable) {
    case CollectionNames.Assets:
      return 'asset'
    default:
      return 'error'
  }
}

const AttachmentCaption = ({
  attachment,
  includeMeta,
  includeParents,
  className,
}: {
  attachment: FullAttachment | Attachment
  includeMeta: boolean
  includeParents: boolean
  className?: string
}) => {
  const isEditor = useIsEditor()
  return (
    <Paper className={className}>
      {includeParents ? (
        <>
          Posted by{' '}
          <Link
            to={routes.viewUserWithVar.replace(
              ':userId',
              attachment.createdby
            )}>
            {isFullAttachment(attachment)
              ? attachment.createdbyusername
              : '(no name)'}
          </Link>
          {includeParents && attachment.parenttable && attachment.parentid ? (
            <>
              {' '}
              for{' '}
              <Link
                to={getParentLink(attachment.parenttable, attachment.parentid)}>
                {getParentLabel(attachment.parenttable, attachment.parentid)}
              </Link>
            </>
          ) : null}
        </>
      ) : null}
      {includeParents && includeMeta ? (
        <>
          <br />
          <br />
        </>
      ) : null}
      {includeMeta || isEditor ? (
        <AttachmentMeta attachment={attachment} />
      ) : null}
    </Paper>
  )
}

export default AttachmentCaption
