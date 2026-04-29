import { makeStyles } from '@mui/styles'
import styled from '@emotion/styled'
import React, { useState } from 'react'
import { Tooltip } from '@mui/material'
import { Chip } from '@mui/material'
import MessageIcon from '@mui/icons-material/Message'
import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'

import useDataStoreItemSync from '@/hooks/useDataStoreItemSync'
import useDatabaseQuery, {
  Operators,
  OrderDirections,
} from '@/hooks/useDatabaseQuery'
import useDataStoreCreate from '@/hooks/useDataStoreCreate'

import {
  AiEvaluateQueuedItemStatus,
  CollectionNames as AiEvaluationCollectionNames,
  type AiEvaluateConvo,
  type AiEvaluateQueuedItem,
} from '@/modules/aievaluation'
import {
  FullAsset_Editor,
  CollectionNames as AssetsCollectionNames,
} from '@/modules/assets'

import StatusText from '@/components/status-text'
import ErrorMessage from '@/components/error-message'
import Button from '@/components/button'
import LoadingIndicator from '@/components/loading-indicator'
import FormattedDate from '@/components/formatted-date'
import CopyThing from '@/components/copy-thing'
import ExperimentalArea from '@/components/experimental-area'
import SuccessMessage from '@/components/success-message'

const useStyles = makeStyles({
  root: {
    borderRadius: '5px',
    border: '1px solid rgba(255,255,255,0.25)',
    padding: '0.5rem',
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
    marginTop: '0.5rem',
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
    fontSize: '75%',
    lineHeight: 1.5,
    '& li': {
      '&:nth-child(even)': {
        fontStyle: 'italic',
      },
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
})

const getPositivityForStatus = (status: AiEvaluateQueuedItemStatus): number => {
  switch (status) {
    case AiEvaluateQueuedItemStatus.Failed:
      return -1
    case AiEvaluateQueuedItemStatus.Processed:
      return 1
    case AiEvaluateQueuedItemStatus.Processing:
      return 0
    case AiEvaluateQueuedItemStatus.Queued:
      return 0
  }
}

const getIconForStatus = (status: AiEvaluateQueuedItemStatus) => {
  switch (status) {
    case AiEvaluateQueuedItemStatus.Failed:
      return <CloseIcon />
    case AiEvaluateQueuedItemStatus.Processed:
      return <CheckIcon />
    case AiEvaluateQueuedItemStatus.Processing:
      return <HourglassEmptyIcon />
    case AiEvaluateQueuedItemStatus.Queued:
      return null
  }
}

const getColor = (value: number) => `hsl(${value * 120}, 100%, 40%)`

const Score = styled.span`
  display: inline-flex;
  color: ${({ value }: { value: number }) => getColor(value)};
`

const capitalize = (text: string) =>
  `${text.substring(0, 1).toUpperCase()}${text.substring(1)}`

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

const getStatusPastTense = (status: AiEvaluateQueuedItemStatus): string => {
  switch (status) {
    case AiEvaluateQueuedItemStatus.Processed:
      return 'Completed'
    case AiEvaluateQueuedItemStatus.Failed:
      return 'Failed'
    case AiEvaluateQueuedItemStatus.Processing:
      return 'Processing'
    case AiEvaluateQueuedItemStatus.Queued:
      return 'Queued'
    default:
      return status
  }
}

const getScoreAsPercentage = (score: number) => 100 * score

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
          <MessageIcon onClick={() => setShowConvo((val) => !val)} />
        </Tooltip>
      </div>
      <div>
        {showConvo ? (
          <ul className={classes.messages}>
            {convo.messages?.map((msg, i) => (
              <li>{msg}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

const AiEvaluationOutput = ({
  queuedItem: staleQueuedItem,
  onClick,
  isMain = false,
}: {
  queuedItem: AiEvaluateQueuedItem
  onClick?: () => void
  isMain?: boolean
}) => {
  const classes = useStyles()
  const [isLoading, lastErrorCode, lastResult] =
    useDataStoreItemSync<AiEvaluateQueuedItem>(
      AiEvaluationCollectionNames.AiEvaluateQueue,
      staleQueuedItem.id
    )
  //   const [isExpanded, setIsExpanded] = useState(false);
  const isExpanded = !isMain

  const queuedItem = lastResult || staleQueuedItem

  const InfoIconWithTooltip = () => (
    <Tooltip title="Click to copy ID">
      <CopyThing text={queuedItem.id}>
        <InfoIcon />
      </CopyThing>
    </Tooltip>
  )

  return (
    <div className={`${classes.item} ${onClick ? classes.clickable : ''}`}>
      {isLoading && <LoadingIndicator message="Subscribing..." />}
      {lastErrorCode && (
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
                <FormattedDate date={queuedItem.createdat} />
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
        {Array.isArray(queuedItem.tags) && (
          <Tags tags={queuedItem.tags} isMain={isMain} />
        )}
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

const AiEvaluationsListForAsset = ({ asset }: { asset: FullAsset_Editor }) => {
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
          <AiEvaluationOutput queuedItem={asset.aievaluation} isMain />
        )}
        <div>Loading...</div>
      </>
    )
  }

  return (
    <>
      {queuedItems && queuedItems.length > 0 ? (
        <ul>
          {queuedItems?.map((queuedItem) => (
            <AiEvaluationOutput key={queuedItem.id} queuedItem={queuedItem} />
          ))}
        </ul>
      ) : queuedItems && queuedItems.length == 0 ? (
        <NoResultsMessage message="No queued items" />
      ) : null}
      <div className={classes.controls}>
        <Button onClick={hydrate} size="small" color="secondary">
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
  const [isLoading, isSuccess, lastErrorCode, create, lastResult] =
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
        color="secondary">
        Re-Queue
      </Button>
    </>
  )
}

const AiEvaluationResult = ({ asset }: { asset: FullAsset_Editor }) => {
  const classes = useStyles()
  const [isShowingMore, setIsShowingMore] = useState(false)
  return (
    <ExperimentalArea>
      <div
        className={`${classes.root} ${isShowingMore ? '' : classes.clickable}`}
        onClick={() => setIsShowingMore(true)}>
        {isShowingMore ? (
          <AiEvaluationsListForAsset asset={asset} />
        ) : (
          <>
            {asset.aievaluation ? (
              <AiEvaluationOutput queuedItem={asset.aievaluation} isMain />
            ) : (
              <NoResultsMessage message="No AI evaluation found" />
            )}
          </>
        )}
      </div>
    </ExperimentalArea>
  )
}

export default AiEvaluationResult
