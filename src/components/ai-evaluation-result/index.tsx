import { makeStyles } from '@mui/styles'
import styled from '@emotion/styled'
import React, { useState } from 'react'
import { Chip } from '@mui/material'
import MessageIcon from '@mui/icons-material/Message'
import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import AspectRatioIcon from '@mui/icons-material/AspectRatio'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import useDataStoreItemSync from '@/hooks/useDataStoreItemSync'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'

import {
  AiEvaluateQueuedItemStatus,
  CollectionNames as AiEvaluationCollectionNames,
  GeminiAssetEvaluation,
  GeminiAssetEvaluationFunctionResult,
  GeminiFuncResult,
  type AiEvaluateConvo,
  type AiEvaluateQueuedItem,
} from '@/modules/aievaluation'
import {
  FullAsset_Editor,
  CollectionNames as AssetsCollectionNames,
  FullAsset_Editor_ForList,
} from '@/modules/assets'

import StatusText from '@/components/status-text'
import ErrorMessage from '@/components/error-message'
import Button from '@/components/button'
import LoadingIndicator from '@/components/loading-indicator'
import FormattedDate from '@/components/formatted-date'
import CopyThing from '@/components/copy-thing'
import ExperimentalArea from '@/components/experimental-area'
import SuccessMessage from '@/components/success-message'
import Dialog from '@/components/dialog'
import Tooltip from '../tooltip'
import {
  getIconForStatus,
  getPositivityForStatus,
  getScoreAsPercentage,
  getStatusPastTense,
  Score,
  Convo as ConvoExpanded,
} from '../ai-result'
import { AiConvoMessage, MessageType } from '@/ai'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  box: {
    borderRadius: '5px',
    cursor: 'default',
    '& a': {
      cursor: 'pointer',
    },
    '& dt': {
      fontWeight: 'bold',
    },
    transition: '100ms all',
    '& ul': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  score: {
    wordBreak: 'keep-all',
    lineBreak: 'strict',
  },
  clickable: {
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(255,255,255,0.1)',
    },
  },
  item: {
    width: '100%',
    padding: '0.5rem 0',
    borderTop: '1px solid rgba(255,255,255,0.25)',
    '&:first-child': {
      paddingTop: 0,
      borderTop: 'none',
    },
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  cells: {
    display: 'flex',
    '& > *': {
      padding: '0 0.5rem',
      '&:first-child': {
        paddingLeft: 0,
      },
      '&:last-child': {
        paddingRight: 0,
      },
    },
  },
  statusText: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  bad: {
    color: 'red',
  },
  good: {
    color: 'green',
  },
  noResultsMessage: {
    padding: '0.5rem',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  result: {
    fontSize: '125%',
    fontWeight: 'bold',
    marginLeft: 'auto',
    userSelect: 'none',
  },
  date: {
    // width: '30%',
    // wordWrap: 'none',
  },
  hydrateBtn: {
    cursor: 'pointer',
  },
  convos: {
    // marginTop: '0.5rem',
  },
  convo: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '75%',
  },
  convoMeta: { width: '20%' },
  convoDesc: { paddingBottom: '0.5rem' },
  controls: {},
  messages: {
    '&, & li': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    fontSize: '75%',
    lineHeight: 1.5,
  },
  message: {
    '&:nth-child(even)': {
      // fontStyle: 'italic',
    },
  },
  button: {
    padding: '0.25rem',
    opacity: 0.5,
    '&:hover': {
      opacity: 1,
    },
  },
  modelName: {
    marginBottom: '-0.25rem',
  },
  tags: {},
  // tag: {
  //   margin: '0 0.1rem 0.1rem 0',
  //   cursor: 'default',
  //   backgroundColor: 'none !important',
  //   fontWeight: 'normal',
  //   opacity: 0.5,
  // },
  chip: {
    margin: '0 0.25rem 0.25rem 0',
    backgroundColor: 'rgba(255,255,255,0.1) !important',
    color: 'rgba(255,255,255,0.75) !important',
    // border: '1px solid rgba(255,255,255,0.75) !important',
    opacity: 0.5,
    fontSize: '80% !important',
  },
  commonTag: {
    opacity: 1,
  },
  row: {
    display: 'flex',
    '& > *': {
      margin: '0.25rem',
      '&:first-child': {
        marginLeft: 0,
      },
      '&:last-child': {
        marginRight: 0,
      },
    },
  },
  cell: {
    width: '100%',
    '&:last-child': {
      textAlign: 'right',
    },
  },
  confidence: {
    fontSize: '75%',
    marginLeft: '0.25rem',
  },
  primaryCell: {},
  openInDialogIcon: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    bottom: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
    transition: '100ms all',
    '&:hover': {
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.5)',
    },
  },
  clickableIcon: {
    cursor: 'pointer',
  },
})

const Tags = ({
  tags,
  queuedItemTags,
  isMain = false,
}: {
  tags: string[]
  queuedItemTags?: string[]
  isMain?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={classes.tags}>
      {tags.map((tag) => (
        <Chip
          color="secondary"
          size="small"
          label={tag}
          classes={{
            root: classes.chip,
          }}
          className={`${
            isMain || queuedItemTags?.includes(tag) ? classes.commonTag : ''
          }`}
        />
      ))}
    </div>
  )
}

const ConvoRenderer = ({
  message,
}: {
  message: AiConvoMessage<any, GeminiAssetEvaluationFunctionResult>
}) => {
  switch (message.type) {
    case MessageType.String:
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: message.contents.replace('\n', '<br />'),
          }}
        />
      )

    case MessageType.FuncResult:
      const { score, score_reason, score_reason_tags } =
        message.contents.evaluation
      return (
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Score</TableCell>
              <TableCell>{score}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tags</TableCell>
              <TableCell>{score_reason_tags.join(',')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Reason</TableCell>
              <TableCell>{score_reason || '(no reason)'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )

    case MessageType.PromptFeedback:
      return (
        <ul>
          <li>Block reason: {message.contents.blockReason || 'none'}</li>
          <li>
            Safety ratings:{' '}
            {message.contents.safetyRatings
              ? message.contents.safetyRatings.join(',')
              : 'none'}
          </li>
        </ul>
      )

    default:
      return (
        <>
          <ErrorMessage>
            Unknown message type: {(message as any).type}
          </ErrorMessage>
          {JSON.stringify(message, null, '  ')}
        </>
      )
  }
}

const Convo = ({ convo, tags }: { convo: AiEvaluateConvo; tags: string[] }) => {
  const [showConvo, setShowConvo] = useState(false)
  const classes = useStyles()
  return (
    <div className={classes.convo}>
      <div className={classes.row}>
        <div>
          <div className={classes.modelName}>{convo.model}</div>
          <Score value={convo.score}>
            {getScoreAsPercentage(convo.score)}%
          </Score>
        </div>
        {convo.tags && (
          <div className={classes.cell}>
            <Tags tags={convo.tags} queuedItemTags={tags} />
          </div>
        )}
        <Tooltip title="Show AI conversation">
          <MessageIcon
            onClick={() => setShowConvo((val) => !val)}
            className={classes.clickableIcon}
          />
        </Tooltip>
      </div>
      <div>
        {showConvo ? (
          <ConvoExpanded
            convo={{ modelName: convo.model, messages: convo.messages }}
            renderer={ConvoRenderer}
          />
        ) : null}
      </div>
    </div>
  )
}

export const Renderer = ({
  queuedItem: staleQueuedItem,
  onClick,
  isMain = false,
}: {
  queuedItem: AiEvaluateQueuedItem
  onClick?: () => void
  isMain?: boolean
}) => {
  const classes = useStyles()
  const [isSubscribing, isSubscribed, lastErrorCode, lastResult] =
    useDataStoreItemSync<AiEvaluateQueuedItem>(
      AiEvaluationCollectionNames.AiEvaluateQueue,
      staleQueuedItem.id
    )
  const isExpanded = !isMain

  const queuedItem = lastResult || staleQueuedItem

  const InfoIconWithTooltip = () => (
    <CopyThing text={queuedItem.id} title="Click to copy ID">
      <InfoIcon />
    </CopyThing>
  )

  const tagsToDisplay: string[] | null =
    Array.isArray(queuedItem.tags) && queuedItem.tags.length
      ? queuedItem.tags
      : queuedItem.convos !== null
      ? queuedItem.convos.reduce<string[]>(
          (newTags, convo) =>
            convo.tags !== null ? newTags.concat(convo.tags) : newTags,
          []
        )
      : null

  return (
    <div className={`${classes.item} ${onClick ? classes.clickable : ''}`}>
      {isSubscribing && <LoadingIndicator message="Subscribing..." />}
      {lastErrorCode !== null && (
        <ErrorMessage>Failed to subscribe: {lastErrorCode}</ErrorMessage>
      )}
      <div className={classes.cells}>
        <div className={classes.cell}>
          {isMain && isExpanded !== true ? (
            <div>AI Evaluation</div>
          ) : (
            <>
              {isMain === false || isExpanded ? (
                <StatusText
                  positivity={getPositivityForStatus(queuedItem.status)}>
                  {getStatusPastTense(queuedItem.status)}{' '}
                  {getIconForStatus(queuedItem.status)}
                </StatusText>
              ) : null}
              <div className={classes.date}>
                <FormattedDate
                  date={queuedItem.lastmodifiedat || queuedItem.createdat}
                />
              </div>
            </>
          )}
        </div>
        <div className={classes.cell}>
          {queuedItem.score !== null ? (
            <>
              <Tooltip
                title={
                  <>
                    These AI models were asked to evaluate this asset:{' '}
                    {queuedItem.convos
                      ? queuedItem.convos.map((convo, i) => (
                          <>
                            {i !== 0 && <br />}
                            {convo.model} ({convo.score})
                          </>
                        ))
                      : queuedItem.status ===
                        AiEvaluateQueuedItemStatus.Processed
                      ? 'No AI models asked yet'
                      : null}
                    <br />
                    0% scores and outliers are ignored
                    <br />
                    Click for more info
                  </>
                }>
                <span className={classes.score}>
                  <Score value={queuedItem.score}>
                    {getScoreAsPercentage(queuedItem.score)}%
                  </Score>
                  <span className={classes.confidence}>
                    confidence <InfoIconWithTooltip />
                  </span>
                </span>
              </Tooltip>
            </>
          ) : queuedItem.status === AiEvaluateQueuedItemStatus.Processed ? (
            <>
              No score found <InfoIconWithTooltip />
            </>
          ) : (
            <InfoIconWithTooltip />
          )}
        </div>
      </div>
      <div>
        {tagsToDisplay && <Tags tags={tagsToDisplay} isMain={isMain} />}
      </div>
      {isExpanded ? (
        <div className={classes.convos}>
          {queuedItem.convos?.map((convo) => (
            <Convo convo={convo} tags={queuedItem.tags!} />
          )) || <NoResultsMessage message="No AI models talked to yet" />}
        </div>
      ) : null}
    </div>
  )
}

const AiEvaluationsListForAsset = ({
  asset,
}: {
  asset: FullAsset_Editor_ForList
}) => {
  const [isLoading, lastErrorCode, queuedItems, hydrate] =
    useDatabaseQuery<AiEvaluateQueuedItem>(
      AiEvaluationCollectionNames.AiEvaluateQueue,
      [
        ['recordtable', Operators.EQUALS, AssetsCollectionNames.Assets],
        ['recordid', Operators.EQUALS, asset.id],
      ],
      {
        orderBy: ['createdat', OrderDirections.DESC],
      }
    )
  const classes = useStyles()

  if (lastErrorCode !== null)
    return (
      <ErrorMessage>Failed to query the queue: {lastErrorCode}</ErrorMessage>
    )

  if (isLoading) {
    return (
      <>
        {asset.aievaluation && (
          <Renderer queuedItem={asset.aievaluation} isMain />
        )}
        <div>Loading...</div>
      </>
    )
  }

  return (
    <>
      {queuedItems && queuedItems.length > 0 ? (
        <div>
          {queuedItems?.map((queuedItem) => (
            <Renderer key={queuedItem.id} queuedItem={queuedItem} />
          ))}
        </div>
      ) : queuedItems && queuedItems.length === 0 ? (
        <NoResultsMessage message="No queued items" />
      ) : null}
      <div className={classes.controls}>
        <Button onClick={hydrate} size="small" color="secondary" hollow>
          Refresh
        </Button>{' '}
        <RequeueButton assetId={asset.id} />
      </div>
    </>
  )
}

const NoResultsMessage = ({ message }: { message: string }) => {
  const classes = useStyles()
  return <div className={classes.noResultsMessage}>{message}</div>
}

const RequeueButton = ({ assetId }: { assetId: string }) => {
  const [isLoading, isSuccess, lastErrorCode, create] =
    useDataStoreCreate<AiEvaluateQueuedItem>(
      AiEvaluationCollectionNames.AiEvaluateQueue
    )

  const onRequeue = async () => {
    await create({
      recordtable: AssetsCollectionNames.Assets,
      recordid: assetId,
    })
  }

  const isBusy = isLoading

  return (
    <>
      {isSuccess && <SuccessMessage>Added to queue</SuccessMessage>}
      {isLoading && <LoadingIndicator message="Adding to queue..." />}
      {lastErrorCode !== null && (
        <ErrorMessage>Failed: {lastErrorCode}</ErrorMessage>
      )}
      <Button
        onClick={onRequeue}
        isDisabled={isBusy}
        size="small"
        color="secondary"
        hollow>
        Re-Queue
      </Button>
    </>
  )
}

const AiEvaluationResult = ({ asset }: { asset: FullAsset_Editor_ForList }) => {
  const classes = useStyles()
  const [isShowingMore, setIsShowingMore] = useState(false)
  const [isDialog, setIsDialog] = useState(false)

  if (isDialog) {
    return (
      <Dialog title="AI Evaluation" onClose={() => setIsDialog(false)}>
        <div style={{ height: 15 }} />
        <AiEvaluationsListForAsset asset={asset} />
      </Dialog>
    )
  }

  return (
    <div className={classes.root}>
      <div
        className={`${classes.box} ${isShowingMore ? '' : classes.clickable}`}
        onClick={() => setIsShowingMore(true)}>
        {isShowingMore ? (
          <AiEvaluationsListForAsset asset={asset} />
        ) : (
          <>
            {asset.aievaluation ? (
              <Renderer queuedItem={asset.aievaluation} isMain />
            ) : (
              <NoResultsMessage message="No AI evaluation yet" />
            )}
          </>
        )}
      </div>
      <div
        className={classes.openInDialogIcon}
        onClick={(e) => {
          setIsDialog(true)
          e.stopPropagation()
          e.preventDefault()
          return false
        }}>
        <AspectRatioIcon />
      </div>
    </div>
  )
}

export default AiEvaluationResult
