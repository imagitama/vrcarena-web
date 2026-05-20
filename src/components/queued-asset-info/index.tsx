import React from 'react'
import { makeStyles } from '@mui/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

import defaultThumbnailUrl from '@/assets/images/default-thumbnail.webp'
import { colorPalette } from '@/config'
import categoryMetas from '@/category-meta'
import {
  AssetCategory,
  CollectionNames as AssetsCollectionNames,
  FullAsset,
  FullAsset_Editor,
} from '@/modules/assets'

import useIsEditor from '@/hooks/useIsEditor'

import UsernameLink from '@/components/username-link'
import FormattedDate from '@/components/formatted-date'
import EditorRecordManager from '@/components/editor-record-manager'
import Message from '@/components/message'
import Columns from '@/components/columns'
import Column from '@/components/column'
import ErrorBoundary from '@/components/error-boundary'
import AiEvaluationResult from '@/components/ai-evaluation-result'
import AiArea from '../ai-area'
import {
  AiEvaluateQueuedItem,
  Intent,
  CollectionNames as AiEvaluateCollectionNames,
} from '@/modules/aievaluation'
import AiResult from '../ai-result'

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

  return (
    <Message title="Queued Asset">
      Published by{' '}
      {asset.publishedby ? (
        <UsernameLink
          id={asset.publishedby}
          username={asset.publishedbyusername}
          reputation={asset.publishedbyreputation}
        />
      ) : (
        '(unknown)'
      )}{' '}
      <br />
      <FormattedDate date={asset.publishedat!} />
      <Columns>
        <Column>
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
                isValid={
                  typeof asset.author === 'string' && asset.author !== ''
                }
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
                  isValid={
                    Array.isArray(asset.species) && asset.species.length > 0
                  }
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
        </Column>
        {isEditor && showEditorControls ? (
          <Column>
            <EditorRecordManager
              id={asset.id}
              collectionName={AssetsCollectionNames.Assets}
              metaCollectionName={AssetsCollectionNames.AssetsMeta}
              existingApprovalStatus={asset.approvalstatus}
              existingPublishStatus={asset.publishstatus}
              existingAccessStatus={asset.accessstatus}
              existingEditorNotes={asset.editornotes}
              onDone={hydrate}
              showStatuses
            />
            <ErrorBoundary>
              <AiArea
                title="Evaluation"
                tooltip="We use AI to evaluate our assets for auto-approval.">
                <AiResult<AiEvaluateQueuedItem, FullAsset_Editor>
                  title="AI Evaluation"
                  renderer={AiEvaluationResult}
                  queueCollectionName={
                    AiEvaluateCollectionNames.AiEvaluateQueue
                  }
                  parentCollectionName={AssetsCollectionNames.Assets}
                  parentId={asset.id}
                  extraFields={{
                    intent: Intent.AutoApprove,
                  }}
                  mostRecentQueuedItem={
                    (asset as FullAsset_Editor).aievaluation
                  }
                />
              </AiArea>
            </ErrorBoundary>
          </Column>
        ) : null}
      </Columns>
    </Message>
  )
}

export default QueuedAssetInfo
