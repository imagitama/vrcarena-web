import React, { useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import { makeStyles } from '@mui/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

import defaultThumbnailUrl from '../../assets/images/default-thumbnail.webp'
import { AssetCategory, CollectionNames, FullAsset } from '../../modules/assets'
import UsernameLink from '../username-link'
import FormattedDate from '../formatted-date'
import EditorRecordManager from '../editor-record-manager'
import useIsEditor from '../../hooks/useIsEditor'
import Message from '../message'
import Button from '../button'
import InlineAssetEditor from '../inline-asset-editor'
import { colorPalette } from '../../config'
import categoryMetas from '../../category-meta'

const useStyles = makeStyles({
  pass: {
    color: colorPalette.positive,
  },
  fail: {
    color: colorPalette.negative,
  },
  notImportant: {
    color: 'rgba(255, 0, 0, 0.5)',
  },
  cell: {
    '& span': {
      display: 'flex',
      alignItems: 'center',
    },
    '& svg': {
      marginRight: '0.25rem',
    },
  },
})

const AssetApprovalChecklistItem = ({
  label,
  isValid,
  isNotImportant,
  validLabel,
  invalidLabel,
  url,
}: {
  label: string
  isValid: boolean
  isNotImportant?: boolean
  validLabel?: string
  invalidLabel?: string
  url?: string
}) => {
  const classes = useStyles()
  return (
    <TableRow key={label}>
      <TableCell align="right">{label}</TableCell>
      <TableCell className={classes.cell}>
        {isValid ? (
          <>
            <span className={classes.pass}>
              {' '}
              <CheckIcon /> {validLabel || 'Good'}
            </span>{' '}
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                Link
              </a>
            ) : null}
          </>
        ) : (
          <span
            className={`${classes.fail} ${
              isNotImportant ? classes.notImportant : ''
            }`}>
            <CloseIcon /> {invalidLabel || 'Not Good'}
          </span>
        )}
      </TableCell>
    </TableRow>
  )
}

const QueuedAssetInfo = ({
  asset,
  hydrate,
  showEditorControls = true,
}: {
  asset: FullAsset
  hydrate?: () => void
  showEditorControls?: boolean
}) => {
  const isEditor = useIsEditor()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <Message title="Queued Asset">
      Published by{' '}
      {asset.publishedby ? (
        <UsernameLink
          id={asset.publishedby}
          username={asset.publishedbyusername}
        />
      ) : (
        '(unknown)'
      )}{' '}
      <FormattedDate date={asset.publishedat!} />
      <Table size="small">
        <TableBody>
          <AssetApprovalChecklistItem
            label="Source"
            isValid={
              typeof asset.sourceurl === 'string' && asset.sourceurl !== ''
            }
            validLabel={'Set'}
            url={
              typeof asset.sourceurl === 'string' && asset.sourceurl !== ''
                ? asset.sourceurl
                : ''
            }
          />
          <AssetApprovalChecklistItem
            label="Thumbnail"
            isValid={
              typeof asset.thumbnailurl === 'string' &&
              asset.thumbnailurl !== '' &&
              asset.thumbnailurl !== defaultThumbnailUrl
            }
            validLabel={'Set'}
          />
          <AssetApprovalChecklistItem
            label="Title"
            isValid={
              typeof asset.title === 'string' &&
              asset.title !== 'My draft asset'
            }
            validLabel="Set"
          />
          <AssetApprovalChecklistItem
            label="Author"
            isValid={typeof asset.author === 'string' && asset.author !== ''}
            validLabel={`Set: ${asset.authorname}`}
          />
          <AssetApprovalChecklistItem
            label="Category"
            isValid={
              typeof asset.category === 'string' &&
              (asset.category as string) !== ''
            }
            validLabel={
              asset.category && asset.category in categoryMetas
                ? categoryMetas[asset.category].nameSingular
                : ''
            }
          />
          <AssetApprovalChecklistItem
            label="Description"
            isValid={
              typeof asset.description === 'string' &&
              asset.description !== '' &&
              asset.description.length > 10
            }
            validLabel={
              asset.description ? `Length: ${asset.description.length}` : ''
            }
            invalidLabel={
              typeof asset.description === 'string'
                ? `Only ${asset.description.length} characters`
                : undefined
            }
          />
          <AssetApprovalChecklistItem
            label="Tags"
            isValid={Array.isArray(asset.tags) && asset.tags.length > 0}
            validLabel={asset.tags ? `${asset.tags.length} tags` : ''}
          />
          {asset.category === AssetCategory.Avatar && (
            <AssetApprovalChecklistItem
              label="Species"
              isValid={Array.isArray(asset.species) && asset.species.length > 0}
              isNotImportant
              validLabel={
                asset.speciesnames && asset.speciesnames.length
                  ? asset.speciesnames.join(', ')
                  : ''
              }
            />
          )}
          <AssetApprovalChecklistItem
            label="Adult Flag"
            isValid={asset.isadult}
            validLabel="Is NSFW"
            invalidLabel="Is not NSFW"
          />
        </TableBody>
      </Table>
      {isEditor && showEditorControls ? (
        <>
          <br />
          <br />
          <Button
            onClick={() => setIsEditing(true)}
            color="secondary"
            icon={<EditIcon />}>
            Inline Edit
          </Button>
          <br />
          <br />
          {isEditing && (
            <InlineAssetEditor
              asset={asset}
              onDone={() => {
                setIsEditing(false)
                if (hydrate) hydrate()
              }}
              onCancel={() => setIsEditing(false)}
            />
          )}
          <EditorRecordManager
            id={asset.id}
            collectionName={CollectionNames.Assets}
            metaCollectionName={CollectionNames.AssetsMeta}
            existingApprovalStatus={asset.approvalstatus}
            existingPublishStatus={asset.publishstatus}
            existingAccessStatus={asset.accessstatus}
            existingEditorNotes={asset.editornotes}
            onDone={hydrate}
            showStatuses
          />
        </>
      ) : null}
    </Message>
  )
}

export default QueuedAssetInfo
